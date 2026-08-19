#![no_std]

mod errors;
mod events;
mod storage;

#[cfg(test)]
mod test;

use errors::ArbError;
use events::ArbEvents;
use soroban_sdk::{
    contract, contractclient, contractimpl, Address, BytesN, Env, String, Vec,
};
use storage::{
    bump_instance, is_arbiter_registered, read_admin, read_dispute, read_dispute_counter,
    set_arbiter_registered, write_admin, write_dispute, write_dispute_counter, DisputeRecord,
    DisputeStatus,
};

/// Cross-contract client interface for RentalEscrow
#[contractclient(name = "EscrowClient")]
pub trait EscrowInterface {
    fn resolve_dispute(
        env: Env,
        escrow_id: u64,
        tenant_payout: i128,
        landlord_payout: i128,
    );
}

#[contract]
pub struct RentalArbitrationContract;

#[contractimpl]
impl RentalArbitrationContract {
    /// Initialize the arbitration contract
    pub fn initialize(env: Env, admin: Address) -> Result<(), ArbError> {
        if read_admin(&env).is_some() {
            return Err(ArbError::AlreadyInitialized);
        }
        admin.require_auth();
        write_admin(&env, &admin);
        write_dispute_counter(&env, 0);
        // Automatically register admin as default arbiter
        set_arbiter_registered(&env, &admin, true);
        bump_instance(&env);
        Ok(())
    }

    /// Admin can register or unregister an authorized arbiter
    pub fn register_arbiter(
        env: Env,
        caller: Address,
        arbiter: Address,
        active: bool,
        fee_bps: u32,
    ) -> Result<(), ArbError> {
        caller.require_auth();
        let admin = read_admin(&env).ok_or(ArbError::NotInitialized)?;
        if caller != admin {
            return Err(ArbError::Unauthorized);
        }

        set_arbiter_registered(&env, &arbiter, active);
        bump_instance(&env);

        if active {
            ArbEvents::arbiter_registered(&env, &arbiter, fee_bps);
        }
        Ok(())
    }

    /// Open a formal arbitration dispute for a locked escrow
    pub fn open_dispute(
        env: Env,
        escrow_contract: Address,
        escrow_id: u64,
        claimant: Address,
        arbiter: Address,
        initial_claim_amount: i128,
        initial_evidence_uri: String,
    ) -> Result<u64, ArbError> {
        claimant.require_auth();
        bump_instance(&env);

        if !is_arbiter_registered(&env, &arbiter) {
            return Err(ArbError::ArbiterNotRegistered);
        }

        let counter = read_dispute_counter(&env);
        let dispute_id = counter + 1;

        let mut evidence_hashes = Vec::new(&env);
        if initial_evidence_uri.len() > 0 {
            evidence_hashes.push_back(initial_evidence_uri.clone());
        }

        let dispute = DisputeRecord {
            dispute_id,
            escrow_contract: escrow_contract.clone(),
            escrow_id,
            assigned_arbiter: arbiter.clone(),
            claimant: claimant.clone(),
            initial_claim_amount,
            evidence_hashes,
            status: DisputeStatus::Open,
            created_at: env.ledger().timestamp(),
            resolved_at: 0,
            tenant_payout: 0,
            landlord_payout: 0,
        };

        write_dispute(&env, &dispute);
        write_dispute_counter(&env, dispute_id);

        ArbEvents::dispute_opened(&env, dispute_id, &escrow_contract, escrow_id, &claimant);
        if initial_evidence_uri.len() > 0 {
            ArbEvents::evidence_submitted(&env, dispute_id, &claimant, initial_evidence_uri);
        }

        Ok(dispute_id)
    }

    /// Submit additional evidence (IPFS CID or SHA256 URI) to an ongoing dispute
    pub fn submit_evidence(
        env: Env,
        dispute_id: u64,
        party: Address,
        evidence_uri: String,
    ) -> Result<(), ArbError> {
        party.require_auth();
        bump_instance(&env);

        let mut dispute = read_dispute(&env, dispute_id).ok_or(ArbError::DisputeNotFound)?;

        if dispute.status != DisputeStatus::Open && dispute.status != DisputeStatus::EvidenceCollection {
            return Err(ArbError::InvalidStatus);
        }

        dispute.evidence_hashes.push_back(evidence_uri.clone());
        dispute.status = DisputeStatus::EvidenceCollection;
        write_dispute(&env, &dispute);

        ArbEvents::evidence_submitted(&env, dispute_id, &party, evidence_uri);
        Ok(())
    }

    /// Arbiter issues final binding ruling and triggers cross-contract escrow resolution
    pub fn issue_ruling(
        env: Env,
        dispute_id: u64,
        arbiter: Address,
        tenant_payout: i128,
        landlord_payout: i128,
    ) -> Result<(), ArbError> {
        arbiter.require_auth();
        bump_instance(&env);

        let mut dispute = read_dispute(&env, dispute_id).ok_or(ArbError::DisputeNotFound)?;

        if dispute.assigned_arbiter != arbiter {
            return Err(ArbError::Unauthorized);
        }
        if dispute.status != DisputeStatus::Open && dispute.status != DisputeStatus::EvidenceCollection {
            return Err(ArbError::InvalidStatus);
        }
        if tenant_payout < 0 || landlord_payout < 0 {
            return Err(ArbError::InvalidSplit);
        }

        // Cross-contract call: invoke resolve_dispute on the target escrow contract
        let escrow_client = EscrowClient::new(&env, &dispute.escrow_contract);
        escrow_client.resolve_dispute(&dispute.escrow_id, &tenant_payout, &landlord_payout);

        dispute.status = DisputeStatus::Ruled;
        dispute.resolved_at = env.ledger().timestamp();
        dispute.tenant_payout = tenant_payout;
        dispute.landlord_payout = landlord_payout;
        write_dispute(&env, &dispute);

        ArbEvents::ruling_issued(
            &env,
            dispute_id,
            &arbiter,
            tenant_payout,
            landlord_payout,
        );

        Ok(())
    }

    /// Read a dispute by ID
    pub fn get_dispute(env: Env, dispute_id: u64) -> Result<DisputeRecord, ArbError> {
        read_dispute(&env, dispute_id).ok_or(ArbError::DisputeNotFound)
    }

    /// Check if an address is a registered arbiter
    pub fn is_arbiter(env: Env, arbiter: Address) -> bool {
        is_arbiter_registered(&env, &arbiter)
    }

    /// Upgrade contract wasm hash
    pub fn upgrade(env: Env, caller: Address, new_wasm_hash: BytesN<32>) -> Result<(), ArbError> {
        caller.require_auth();
        let admin = read_admin(&env).ok_or(ArbError::NotInitialized)?;
        if caller != admin {
            return Err(ArbError::Unauthorized);
        }
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }
}
