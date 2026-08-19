use soroban_sdk::{contracttype, Address, Env, String, Vec};

pub const DAY_IN_LEDGERS: u32 = 17280;
pub const INSTANCE_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
pub const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

pub const PERSISTENT_BUMP_AMOUNT: u32 = 120 * DAY_IN_LEDGERS;
pub const PERSISTENT_LIFETIME_THRESHOLD: u32 = PERSISTENT_BUMP_AMOUNT - 30 * DAY_IN_LEDGERS;

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum DisputeStatus {
    Open = 0,
    EvidenceCollection = 1,
    Ruled = 2,
    Cancelled = 3,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct DisputeRecord {
    pub dispute_id: u64,
    pub escrow_contract: Address,
    pub escrow_id: u64,
    pub assigned_arbiter: Address,
    pub claimant: Address,
    pub initial_claim_amount: i128,
    pub evidence_hashes: Vec<String>,
    pub status: DisputeStatus,
    pub created_at: u64,
    pub resolved_at: u64,
    pub tenant_payout: i128,
    pub landlord_payout: i128,
}

#[derive(Clone)]
#[contracttype]
pub enum ArbiterKey {
    Admin,
    DisputeCounter,
    Dispute(u64),
    RegisteredArbiter(Address),
}

pub fn read_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&ArbiterKey::Admin)
}

pub fn write_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&ArbiterKey::Admin, admin);
}

pub fn read_dispute_counter(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&ArbiterKey::DisputeCounter)
        .unwrap_or(0)
}

pub fn write_dispute_counter(env: &Env, counter: u64) {
    env.storage()
        .instance()
        .set(&ArbiterKey::DisputeCounter, &counter);
}

pub fn is_arbiter_registered(env: &Env, arbiter: &Address) -> bool {
    env.storage()
        .instance()
        .has(&ArbiterKey::RegisteredArbiter(arbiter.clone()))
}

pub fn set_arbiter_registered(env: &Env, arbiter: &Address, active: bool) {
    let key = ArbiterKey::RegisteredArbiter(arbiter.clone());
    if active {
        env.storage().instance().set(&key, &true);
    } else {
        env.storage().instance().remove(&key);
    }
}

pub fn read_dispute(env: &Env, dispute_id: u64) -> Option<DisputeRecord> {
    let key = ArbiterKey::Dispute(dispute_id);
    let record = env.storage().persistent().get(&key);
    if record.is_some() {
        env.storage().persistent().extend_ttl(
            &key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );
    }
    record
}

pub fn write_dispute(env: &Env, dispute: &DisputeRecord) {
    let key = ArbiterKey::Dispute(dispute.dispute_id);
    env.storage().persistent().set(&key, dispute);
    env.storage().persistent().extend_ttl(
        &key,
        PERSISTENT_LIFETIME_THRESHOLD,
        PERSISTENT_BUMP_AMOUNT,
    );
}

pub fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}
