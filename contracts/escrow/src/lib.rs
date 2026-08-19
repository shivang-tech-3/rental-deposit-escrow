#![no_std]

mod errors;
mod events;
mod storage;

#[cfg(test)]
mod test;

use errors::EscrowError;
use events::EscrowEvents;
use soroban_sdk::{
    contract, contractimpl, token, Address, BytesN, Env, Symbol,
};
use storage::{
    bump_instance, has_admin, is_paused, read_admin, read_counter, read_escrow, set_paused,
    write_admin, write_counter, write_escrow, EscrowAgreement, EscrowStatus,
};

#[contract]
pub struct RentalEscrowContract;

#[contractimpl]
impl RentalEscrowContract {
    /// Initialize the contract with an admin
    pub fn initialize(env: Env, admin: Address) -> Result<(), EscrowError> {
        if has_admin(&env) {
            return Err(EscrowError::AlreadyInitialized);
        }
        admin.require_auth();
        write_admin(&env, &admin);
        write_counter(&env, 0);
        bump_instance(&env);
        Ok(())
    }

    /// Create a new escrow agreement
    pub fn create_escrow(
        env: Env,
        landlord: Address,
        tenant: Address,
        token: Address,
        deposit_amount: i128,
        inspection_seconds: u64,
        arbiter_contract: Address,
    ) -> Result<u64, EscrowError> {
        if is_paused(&env) {
            return Err(EscrowError::ContractPaused);
        }
        if deposit_amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }
        if inspection_seconds == 0 {
            return Err(EscrowError::InvalidInspectionDays);
        }

        landlord.require_auth();
        bump_instance(&env);

        let current_counter = read_counter(&env);
        let escrow_id = current_counter + 1;

        let agreement = EscrowAgreement {
            id: escrow_id,
            landlord: landlord.clone(),
            tenant: tenant.clone(),
            token: token.clone(),
            deposit_amount,
            inspection_seconds,
            checkout_timestamp: 0,
            arbiter_contract: arbiter_contract.clone(),
            status: EscrowStatus::Created,
            created_at: env.ledger().timestamp(),
        };

        write_escrow(&env, &agreement);
        write_counter(&env, escrow_id);

        EscrowEvents::escrow_created(
            &env,
            escrow_id,
            &landlord,
            &tenant,
            &token,
            deposit_amount,
            inspection_seconds,
            &arbiter_contract,
        );

        Ok(escrow_id)
    }

    /// Tenant deposits the required rental deposit into escrow
    pub fn deposit(env: Env, escrow_id: u64, from: Address) -> Result<(), EscrowError> {
        if is_paused(&env) {
            return Err(EscrowError::ContractPaused);
        }

        from.require_auth();
        bump_instance(&env);

        let mut agreement = read_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;

        if agreement.status != EscrowStatus::Created {
            return Err(EscrowError::DepositAlreadyFunded);
        }
        if agreement.tenant != from {
            return Err(EscrowError::Unauthorized);
        }

        // Transfer funds from tenant to this contract
        let client = token::Client::new(&env, &agreement.token);
        client.transfer(&from, &env.current_contract_address(), &agreement.deposit_amount);

        agreement.status = EscrowStatus::Funded;
        write_escrow(&env, &agreement);

        EscrowEvents::deposit_funded(&env, escrow_id, &agreement.tenant, agreement.deposit_amount);
        Ok(())
    }

    /// Initiate checkout notice to start the inspection countdown
    pub fn initiate_checkout(env: Env, escrow_id: u64, caller: Address) -> Result<(), EscrowError> {
        if is_paused(&env) {
            return Err(EscrowError::ContractPaused);
        }

        caller.require_auth();
        bump_instance(&env);

        let mut agreement = read_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;

        if agreement.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidState);
        }
        if caller != agreement.tenant && caller != agreement.landlord {
            return Err(EscrowError::Unauthorized);
        }

        let now = env.ledger().timestamp();
        agreement.checkout_timestamp = now;
        agreement.status = EscrowStatus::CheckoutInitiated;
        write_escrow(&env, &agreement);

        let deadline = now + agreement.inspection_seconds;
        EscrowEvents::checkout_initiated(&env, escrow_id, &caller, deadline);
        Ok(())
    }

    /// Landlord explicitly releases deposit back to tenant
    pub fn confirm_release(env: Env, escrow_id: u64, landlord: Address) -> Result<(), EscrowError> {
        if is_paused(&env) {
            return Err(EscrowError::ContractPaused);
        }

        landlord.require_auth();
        bump_instance(&env);

        let mut agreement = read_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;

        if agreement.landlord != landlord {
            return Err(EscrowError::Unauthorized);
        }
        if agreement.status != EscrowStatus::Funded
            && agreement.status != EscrowStatus::CheckoutInitiated
        {
            return Err(EscrowError::InvalidState);
        }

        let client = token::Client::new(&env, &agreement.token);
        client.transfer(
            &env.current_contract_address(),
            &agreement.tenant,
            &agreement.deposit_amount,
        );

        agreement.status = EscrowStatus::Released;
        write_escrow(&env, &agreement);

        EscrowEvents::release_confirmed(&env, escrow_id, &landlord, agreement.deposit_amount);
        Ok(())
    }

    /// Automatic release of deposit if inspection window elapses with no dispute
    pub fn claim_auto_release(env: Env, escrow_id: u64) -> Result<(), EscrowError> {
        if is_paused(&env) {
            return Err(EscrowError::ContractPaused);
        }

        bump_instance(&env);

        let mut agreement = read_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;

        if agreement.status != EscrowStatus::CheckoutInitiated {
            return Err(EscrowError::InvalidState);
        }

        let now = env.ledger().timestamp();
        let unlock_time = agreement.checkout_timestamp + agreement.inspection_seconds;

        if now < unlock_time {
            return Err(EscrowError::InspectionPeriodActive);
        }

        let client = token::Client::new(&env, &agreement.token);
        client.transfer(
            &env.current_contract_address(),
            &agreement.tenant,
            &agreement.deposit_amount,
        );

        agreement.status = EscrowStatus::Released;
        write_escrow(&env, &agreement);

        EscrowEvents::auto_released(&env, escrow_id, &agreement.tenant, agreement.deposit_amount);
        Ok(())
    }

    /// Raise a dispute before auto-release
    pub fn raise_dispute(
        env: Env,
        escrow_id: u64,
        claimant: Address,
        claim_amount: i128,
        reason_hash: Symbol,
    ) -> Result<(), EscrowError> {
        if is_paused(&env) {
            return Err(EscrowError::ContractPaused);
        }

        claimant.require_auth();
        bump_instance(&env);

        let mut agreement = read_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;

        if agreement.status != EscrowStatus::Funded
            && agreement.status != EscrowStatus::CheckoutInitiated
        {
            return Err(EscrowError::InvalidState);
        }
        if claimant != agreement.tenant && claimant != agreement.landlord {
            return Err(EscrowError::Unauthorized);
        }
        if claim_amount <= 0 || claim_amount > agreement.deposit_amount {
            return Err(EscrowError::InvalidAmount);
        }

        agreement.status = EscrowStatus::Disputed;
        write_escrow(&env, &agreement);

        EscrowEvents::dispute_raised(&env, escrow_id, &claimant, claim_amount, reason_hash);
        Ok(())
    }

    /// Inter-contract call target: Only the registered Arbitration contract can resolve
    pub fn resolve_dispute(
        env: Env,
        escrow_id: u64,
        tenant_payout: i128,
        landlord_payout: i128,
    ) -> Result<(), EscrowError> {
        if is_paused(&env) {
            return Err(EscrowError::ContractPaused);
        }

        bump_instance(&env);

        let mut agreement = read_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;

        // Only the assigned arbitration contract address is authorized to call resolve_dispute
        agreement.arbiter_contract.require_auth();

        if agreement.status != EscrowStatus::Disputed {
            return Err(EscrowError::InvalidState);
        }
        if tenant_payout < 0 || landlord_payout < 0 {
            return Err(EscrowError::InvalidAmount);
        }
        if tenant_payout + landlord_payout != agreement.deposit_amount {
            return Err(EscrowError::RulingAmountMismatch);
        }

        let client = token::Client::new(&env, &agreement.token);

        if tenant_payout > 0 {
            client.transfer(
                &env.current_contract_address(),
                &agreement.tenant,
                &tenant_payout,
            );
        }
        if landlord_payout > 0 {
            client.transfer(
                &env.current_contract_address(),
                &agreement.landlord,
                &landlord_payout,
            );
        }

        agreement.status = EscrowStatus::Resolved;
        write_escrow(&env, &agreement);

        EscrowEvents::dispute_resolved(
            &env,
            escrow_id,
            &agreement.arbiter_contract,
            tenant_payout,
            landlord_payout,
        );
        Ok(())
    }

    /// Read an escrow agreement
    pub fn get_escrow(env: Env, escrow_id: u64) -> Result<EscrowAgreement, EscrowError> {
        read_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)
    }

    /// Read the total escrow count
    pub fn get_escrow_count(env: Env) -> u64 {
        read_counter(&env)
    }

    /// Admin can pause or unpause contract in emergency
    pub fn set_pause(env: Env, caller: Address, paused: bool) -> Result<(), EscrowError> {
        caller.require_auth();
        let admin = read_admin(&env).ok_or(EscrowError::NotInitialized)?;
        if caller != admin {
            return Err(EscrowError::Unauthorized);
        }
        set_paused(&env, paused);
        bump_instance(&env);
        Ok(())
    }

    /// Upgrade contract wasm hash
    pub fn upgrade(env: Env, caller: Address, new_wasm_hash: BytesN<32>) -> Result<(), EscrowError> {
        caller.require_auth();
        let admin = read_admin(&env).ok_or(EscrowError::NotInitialized)?;
        if caller != admin {
            return Err(EscrowError::Unauthorized);
        }
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }
}
