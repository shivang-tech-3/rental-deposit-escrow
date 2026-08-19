use soroban_sdk::{contracttype, Address, Env};

pub const DAY_IN_LEDGERS: u32 = 17280;
pub const INSTANCE_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
pub const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

pub const PERSISTENT_BUMP_AMOUNT: u32 = 120 * DAY_IN_LEDGERS;
pub const PERSISTENT_LIFETIME_THRESHOLD: u32 = PERSISTENT_BUMP_AMOUNT - 30 * DAY_IN_LEDGERS;

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum EscrowStatus {
    Created = 0,
    Funded = 1,
    CheckoutInitiated = 2,
    Disputed = 3,
    Released = 4,
    Resolved = 5,
    Cancelled = 6,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct EscrowAgreement {
    pub id: u64,
    pub landlord: Address,
    pub tenant: Address,
    pub token: Address,
    pub deposit_amount: i128,
    pub inspection_seconds: u64,
    pub checkout_timestamp: u64,
    pub arbiter_contract: Address,
    pub status: EscrowStatus,
    pub created_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    EscrowCounter,
    Escrow(u64),
    Paused,
}

pub fn read_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Admin)
}

pub fn write_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

pub fn read_counter(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::EscrowCounter)
        .unwrap_or(0)
}

pub fn write_counter(env: &Env, counter: u64) {
    env.storage()
        .instance()
        .set(&DataKey::EscrowCounter, &counter);
}

pub fn read_escrow(env: &Env, escrow_id: u64) -> Option<EscrowAgreement> {
    let key = DataKey::Escrow(escrow_id);
    let escrow = env.storage().persistent().get(&key);
    if escrow.is_some() {
        env.storage().persistent().extend_ttl(
            &key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );
    }
    escrow
}

pub fn write_escrow(env: &Env, escrow: &EscrowAgreement) {
    let key = DataKey::Escrow(escrow.id);
    env.storage().persistent().set(&key, escrow);
    env.storage().persistent().extend_ttl(
        &key,
        PERSISTENT_LIFETIME_THRESHOLD,
        PERSISTENT_BUMP_AMOUNT,
    );
}

pub fn is_paused(env: &Env) -> bool {
    env.storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false)
}

pub fn set_paused(env: &Env, paused: bool) {
    env.storage().instance().set(&DataKey::Paused, &paused);
}

pub fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}
