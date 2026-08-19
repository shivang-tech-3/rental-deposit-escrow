# Deploy Rental Deposit Escrow to Stellar Testnet (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "=== Deploying Rental Deposit Escrow to Stellar Testnet ===" -ForegroundColor Cyan

# Check stellar CLI
if (-not (Get-Command "stellar" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: stellar CLI not found in PATH. Install with: cargo install --locked stellar-cli --features opt" -ForegroundColor Red
    exit 1
}

$Network = "testnet"
Write-Host "1. Ensuring deployer identity exists..." -ForegroundColor Yellow
try {
    stellar keys generate --network $Network deployer
} catch {
    Write-Host "Deployer identity already generated or funded." -ForegroundColor Gray
}

$DeployerAddr = (stellar keys address deployer).Trim()
Write-Host "Deployer Address: $DeployerAddr" -ForegroundColor Green

Write-Host "2. Compiling Soroban smart contracts..." -ForegroundColor Yellow
cargo build --target wasm32-unknown-unknown --release

Write-Host "3. Deploying Escrow Contract..." -ForegroundColor Yellow
$EscrowWasm = "target/wasm32-unknown-unknown/release/rental_escrow.wasm"
$EscrowId = (stellar contract deploy --wasm $EscrowWasm --source deployer --network $Network).Trim()
Write-Host "✅ Escrow Contract Deployed: $EscrowId" -ForegroundColor Green

Write-Host "4. Deploying Arbitration Contract..." -ForegroundColor Yellow
$ArbWasm = "target/wasm32-unknown-unknown/release/rental_arbitration.wasm"
$ArbId = (stellar contract deploy --wasm $ArbWasm --source deployer --network $Network).Trim()
Write-Host "✅ Arbitration Contract Deployed: $ArbId" -ForegroundColor Green

Write-Host "5. Initializing contracts..." -ForegroundColor Yellow
stellar contract invoke --id $EscrowId --source deployer --network $Network -- initialize --admin $DeployerAddr
stellar contract invoke --id $ArbId --source deployer --network $Network -- initialize --admin $DeployerAddr

Write-Host "6. Updating frontend/.env.local with deployed contract addresses..." -ForegroundColor Yellow
$envContent = @"
NEXT_PUBLIC_ESCROW_CONTRACT_ID=$EscrowId
NEXT_PUBLIC_ARBITRATION_CONTRACT_ID=$ArbId
NEXT_PUBLIC_DEFAULT_NETWORK=TESTNET
NEXT_PUBLIC_TESTNET_RPC_URL=https://soroban-testnet.stellar.org
"@

Set-Content -Path "frontend/.env.local" -Value $envContent

Write-Host "`n=== Deployment Completed Successfully ===" -ForegroundColor Cyan
Write-Host "Escrow Contract:      $EscrowId" -ForegroundColor White
Write-Host "Arbitration Contract: $ArbId" -ForegroundColor White
Write-Host "Explorer Escrow:      https://stellar.expert/explorer/testnet/contract/$EscrowId" -ForegroundColor DarkCyan
Write-Host "Explorer Arbitration: https://stellar.expert/explorer/testnet/contract/$ArbId" -ForegroundColor DarkCyan
