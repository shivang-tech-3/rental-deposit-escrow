use soroban_sdk::{symbol_short, Address, Env, Symbol};

pub struct EscrowEvents;

impl EscrowEvents {
    pub fn escrow_created(
        env: &Env,
        escrow_id: u64,
        landlord: &Address,
        tenant: &Address,
        token: &Address,
        amount: i128,
        inspection_seconds: u64,
        arbiter_contract: &Address,
    ) {
        let topics = (symbol_short!("created"), escrow_id, landlord.clone());
        env.events().publish(
            topics,
            (
                tenant.clone(),
                token.clone(),
                amount,
                inspection_seconds,
                arbiter_contract.clone(),
            ),
        );
    }

    pub fn deposit_funded(env: &Env, escrow_id: u64, tenant: &Address, amount: i128) {
        let topics = (symbol_short!("funded"), escrow_id, tenant.clone());
        env.events().publish(topics, amount);
    }

    pub fn checkout_initiated(env: &Env, escrow_id: u64, initiator: &Address, deadline: u64) {
        let topics = (symbol_short!("checkout"), escrow_id, initiator.clone());
        env.events().publish(topics, deadline);
    }

    pub fn release_confirmed(env: &Env, escrow_id: u64, landlord: &Address, amount: i128) {
        let topics = (symbol_short!("released"), escrow_id, landlord.clone());
        env.events().publish(topics, amount);
    }

    pub fn auto_released(env: &Env, escrow_id: u64, tenant: &Address, amount: i128) {
        let topics = (symbol_short!("autorel"), escrow_id, tenant.clone());
        env.events().publish(topics, amount);
    }

    pub fn dispute_raised(
        env: &Env,
        escrow_id: u64,
        claimant: &Address,
        claim_amount: i128,
        reason_hash: Symbol,
    ) {
        let topics = (symbol_short!("disputed"), escrow_id, claimant.clone());
        env.events().publish(topics, (claim_amount, reason_hash));
    }

    pub fn dispute_resolved(
        env: &Env,
        escrow_id: u64,
        arbiter: &Address,
        tenant_payout: i128,
        landlord_payout: i128,
    ) {
        let topics = (symbol_short!("resolved"), escrow_id, arbiter.clone());
        env.events().publish(topics, (tenant_payout, landlord_payout));
    }
}
