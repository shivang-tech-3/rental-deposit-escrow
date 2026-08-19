#![cfg(test)]

use crate::{errors::EscrowError, storage::EscrowStatus, RentalEscrowContract, RentalEscrowContractClient};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, Client as TokenClient},
    Address, Env, Symbol,
};

fn setup_test<'a>() -> (
    Env,
    RentalEscrowContractClient<'a>,
    Address,
    Address,
    Address,
    TokenClient<'a>,
    StellarAssetClient<'a>,
    Address,
) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let landlord = Address::generate(&env);
    let tenant = Address::generate(&env);
    let arbiter_contract = Address::generate(&env);

    let contract_id = env.register(RentalEscrowContract, ());
    let client = RentalEscrowContractClient::new(&env, &contract_id);

    client.initialize(&admin);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_client = TokenClient::new(&env, &token_contract.address());
    let token_admin_client = StellarAssetClient::new(&env, &token_contract.address());

    // Mint tokens to tenant
    token_admin_client.mint(&tenant, &10_000_0000000);

    (
        env,
        client,
        admin,
        landlord,
        tenant,
        token_client,
        token_admin_client,
        arbiter_contract,
    )
}

#[test]
fn test_escrow_initialization_and_creation() {
    let (_env, client, admin, landlord, tenant, token_client, _token_admin, arbiter_contract) =
        setup_test();

    let deposit_amount = 1_000_0000000;
    let inspection_seconds = 86400 * 7; // 7 days

    let escrow_id = client.create_escrow(
        &landlord,
        &tenant,
        &token_client.address,
        &deposit_amount,
        &inspection_seconds,
        &arbiter_contract,
    );

    assert_eq!(escrow_id, 1);
    assert_eq!(client.get_escrow_count(), 1);

    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.landlord, landlord);
    assert_eq!(escrow.tenant, tenant);
    assert_eq!(escrow.deposit_amount, deposit_amount);
    assert_eq!(escrow.status, EscrowStatus::Created);

    // Double init should fail
    let err = client.try_initialize(&admin).unwrap_err().unwrap();
    assert_eq!(err, EscrowError::AlreadyInitialized);
}

#[test]
fn test_escrow_deposit_and_direct_release() {
    let (_env, client, _admin, landlord, tenant, token_client, _token_admin, arbiter_contract) =
        setup_test();

    let deposit_amount = 1_000_0000000;
    let inspection_seconds = 86400 * 3;

    let escrow_id = client.create_escrow(
        &landlord,
        &tenant,
        &token_client.address,
        &deposit_amount,
        &inspection_seconds,
        &arbiter_contract,
    );

    // Tenant deposits funds
    client.deposit(&escrow_id, &tenant);

    let escrow_after_deposit = client.get_escrow(&escrow_id);
    assert_eq!(escrow_after_deposit.status, EscrowStatus::Funded);
    assert_eq!(
        token_client.balance(&client.address),
        deposit_amount
    );

    // Landlord approves direct release
    client.confirm_release(&escrow_id, &landlord);

    let escrow_after_release = client.get_escrow(&escrow_id);
    assert_eq!(escrow_after_release.status, EscrowStatus::Released);
    assert_eq!(token_client.balance(&client.address), 0);
    assert_eq!(token_client.balance(&tenant), 10_000_0000000);
}

#[test]
fn test_inspection_period_timelock_auto_release() {
    let (env, client, _admin, landlord, tenant, token_client, _token_admin, arbiter_contract) =
        setup_test();

    let deposit_amount = 500_0000000;
    let inspection_seconds = 1000;

    let escrow_id = client.create_escrow(
        &landlord,
        &tenant,
        &token_client.address,
        &deposit_amount,
        &inspection_seconds,
        &arbiter_contract,
    );

    client.deposit(&escrow_id, &tenant);

    // Tenant initiates checkout
    client.initiate_checkout(&escrow_id, &tenant);

    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.status, EscrowStatus::CheckoutInitiated);

    // Attempting auto-release before inspection window expires must fail
    let early_claim_err = client.try_claim_auto_release(&escrow_id).unwrap_err().unwrap();
    assert_eq!(early_claim_err, EscrowError::InspectionPeriodActive);

    // Advance ledger timestamp beyond inspection window
    env.ledger().set_timestamp(escrow.checkout_timestamp + inspection_seconds + 1);

    // Auto-release succeeds
    client.claim_auto_release(&escrow_id);

    let escrow_released = client.get_escrow(&escrow_id);
    assert_eq!(escrow_released.status, EscrowStatus::Released);
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn test_dispute_and_resolution() {
    let (_env, client, _admin, landlord, tenant, token_client, _token_admin, arbiter_contract) =
        setup_test();

    let deposit_amount = 2_000_0000000;
    let inspection_seconds = 5000;

    let escrow_id = client.create_escrow(
        &landlord,
        &tenant,
        &token_client.address,
        &deposit_amount,
        &inspection_seconds,
        &arbiter_contract,
    );

    client.deposit(&escrow_id, &tenant);
    client.initiate_checkout(&escrow_id, &landlord);

    // Landlord raises dispute for damages
    let claim_amount = 800_0000000;
    let reason_hash = Symbol::new(&_env, "dmg_wall");
    client.raise_dispute(&escrow_id, &landlord, &claim_amount, &reason_hash);

    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.status, EscrowStatus::Disputed);

    // Resolution: 1200 back to tenant, 800 to landlord
    let tenant_payout = 1_200_0000000;
    let landlord_payout = 800_0000000;

    client.resolve_dispute(&escrow_id, &tenant_payout, &landlord_payout);

    let escrow_resolved = client.get_escrow(&escrow_id);
    assert_eq!(escrow_resolved.status, EscrowStatus::Resolved);
    assert_eq!(token_client.balance(&landlord), landlord_payout);
    assert_eq!(token_client.balance(&client.address), 0);
}
