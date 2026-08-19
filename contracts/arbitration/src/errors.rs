use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ArbError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    DisputeNotFound = 4,
    DisputeAlreadyExists = 5,
    InvalidStatus = 6,
    ArbiterNotRegistered = 7,
    InvalidSplit = 8,
    EscrowCallFailed = 9,
}
