use soroban_sdk::{symbol_short, Address, Env, String};

pub struct ArbEvents;

impl ArbEvents {
    pub fn arbiter_registered(env: &Env, arbiter: &Address, fee_bps: u32) {
        let topics = (symbol_short!("arbr_reg"), arbiter.clone());
        env.events().publish(topics, fee_bps);
    }

    pub fn dispute_opened(
        env: &Env,
        dispute_id: u64,
        escrow_contract: &Address,
        escrow_id: u64,
        claimant: &Address,
    ) {
        let topics = (symbol_short!("dsp_open"), dispute_id, claimant.clone());
        env.events().publish(topics, (escrow_contract.clone(), escrow_id));
    }

    pub fn evidence_submitted(env: &Env, dispute_id: u64, party: &Address, ipfs_cid: String) {
        let topics = (symbol_short!("evid_sub"), dispute_id, party.clone());
        env.events().publish(topics, ipfs_cid);
    }

    pub fn ruling_issued(
        env: &Env,
        dispute_id: u64,
        arbiter: &Address,
        tenant_payout: i128,
        landlord_payout: i128,
    ) {
        let topics = (symbol_short!("ruling"), dispute_id, arbiter.clone());
        env.events().publish(topics, (tenant_payout, landlord_payout));
    }
}
