use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    EscrowNotFound = 4,
    EscrowAlreadyExists = 5,
    InvalidAmount = 6,
    InvalidState = 7,
    InspectionPeriodNotPassed = 8,
    InspectionPeriodActive = 9,
    DepositAlreadyFunded = 10,
    ArbiterMismatch = 11,
    RulingAmountMismatch = 12,
    InvalidInspectionDays = 13,
    ContractPaused = 14,
}
