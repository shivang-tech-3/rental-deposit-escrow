#![cfg(test)]

use crate::{
    errors::ArbError, storage::DisputeStatus, RentalArbitrationContract,
    RentalArbitrationContractClient,
};
use soroban_sdk::{
    contract, contractimpl, testutils::Address as _, Address, Env, String,
};

// Mock Escrow contract for standalone arbitration tests
#[contract]
pub struct MockEscrowContract;

#[contractimpl]
impl MockEscrowContract {
    pub fn resolve_dispute(
        env: Env,
        _escrow_id: u64,
        _tenant_payout: i128,
        _landlord_payout: i128,
    ) {
        // Mock successful receipt
        env.storage().instance().set(&1u32, &true);
    }
}

#[test]
fn test_arbitration_lifecycle_and_cross_contract_ruling() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let arbiter = Address::generate(&env);
    let claimant = Address::generate(&env);

    let arb_id = env.register(RentalArbitrationContract, ());
    let arb_client = RentalArbitrationContractClient::new(&env, &arb_id);

    arb_client.initialize(&admin);

    // Register an official arbiter
    arb_client.register_arbiter(&admin, &arbiter, &true, &250);
    assert!(arb_client.is_arbiter(&arbiter));

    // Register mock escrow contract
    let mock_escrow_id = env.register(MockEscrowContract, ());

    // Open dispute
    let cid1 = String::from_str(&env, "ipfs://bafybeicid_initial_damage_photos");
    let dispute_id = arb_client.open_dispute(
        &mock_escrow_id,
        &1u64,
        &claimant,
        &arbiter,
        &500_0000000,
        &cid1,
    );

    assert_eq!(dispute_id, 1);

    let dispute = arb_client.get_dispute(&dispute_id);
    assert_eq!(dispute.status, DisputeStatus::Open);
    assert_eq!(dispute.evidence_hashes.len(), 1);

    // Submit additional counter-evidence
    let cid2 = String::from_str(&env, "ipfs://bafybeicid_move_in_inspection_receipt");
    arb_client.submit_evidence(&dispute_id, &claimant, &cid2);

    let dispute_updated = arb_client.get_dispute(&dispute_id);
    assert_eq!(dispute_updated.status, DisputeStatus::EvidenceCollection);
    assert_eq!(dispute_updated.evidence_hashes.len(), 2);

    // Arbiter issues ruling (cross-contract call)
    let tenant_payout = 300_0000000;
    let landlord_payout = 200_0000000;
    arb_client.issue_ruling(&dispute_id, &arbiter, &tenant_payout, &landlord_payout);

    let dispute_final = arb_client.get_dispute(&dispute_id);
    assert_eq!(dispute_final.status, DisputeStatus::Ruled);
    assert_eq!(dispute_final.tenant_payout, tenant_payout);
    assert_eq!(dispute_final.landlord_payout, landlord_payout);
}

#[test]
fn test_unauthorized_arbiter_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let fake_arbiter = Address::generate(&env);
    let claimant = Address::generate(&env);
    let mock_escrow = Address::generate(&env);

    let arb_id = env.register(RentalArbitrationContract, ());
    let arb_client = RentalArbitrationContractClient::new(&env, &arb_id);

    arb_client.initialize(&admin);

    let cid = String::from_str(&env, "ipfs://test");
    let err = arb_client
        .try_open_dispute(
            &mock_escrow,
            &1u64,
            &claimant,
            &fake_arbiter,
            &100,
            &cid,
        )
        .unwrap_err()
        .unwrap();

    assert_eq!(err, ArbError::ArbiterNotRegistered);
}
