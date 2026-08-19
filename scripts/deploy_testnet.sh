#!/usr/bin/env bash
set -e

echo "=== Deploying Rental Deposit Escrow to Stellar Testnet ==="

# Check stellar-cli
if ! command -v stellar &> /dev/null; then
    echo "Error: stellar CLI not found. Please install via: cargo install --locked stellar-cli --features opt"
    exit 1
fi

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org:443"
PASSPHRASE="Test SDF Network ; September 2015"

echo "1. Checking or generating deployer identity..."
stellar keys generate --network $NETWORK deployer || true
DEPLOYER_ADDR=$(stellar keys address deployer)
echo "Deployer Address: $DEPLOYER_ADDR"

echo "2. Building Soroban smart contracts (release)..."
cargo build --target wasm32-unknown-unknown --release

echo "3. Deploying Rental Escrow Contract..."
ESCROW_WASM="target/wasm32-unknown-unknown/release/rental_escrow.wasm"
ESCROW_ID=$(stellar contract deploy \
  --wasm "$ESCROW_WASM" \
  --source deployer \
  --network $NETWORK)
echo "✅ Escrow Contract Deployed ID: $ESCROW_ID"

echo "4. Deploying Rental Arbitration Contract..."
ARB_WASM="target/wasm32-unknown-unknown/release/rental_arbitration.wasm"
ARB_ID=$(stellar contract deploy \
  --wasm "$ARB_WASM" \
  --source deployer \
  --network $NETWORK)
echo "✅ Arbitration Contract Deployed ID: $ARB_ID"

echo "5. Initializing contracts..."
stellar contract invoke \
  --id "$ESCROW_ID" \
  --source deployer \
  --network $NETWORK \
  -- initialize --admin "$DEPLOYER_ADDR"

stellar contract invoke \
  --id "$ARB_ID" \
  --source deployer \
  --network $NETWORK \
  -- initialize --admin "$DEPLOYER_ADDR"

echo "6. Writing deployed contract addresses to frontend .env.local..."
cat <<EOF > frontend/.env.local
NEXT_PUBLIC_ESCROW_CONTRACT_ID=$ESCROW_ID
NEXT_PUBLIC_ARBITRATION_CONTRACT_ID=$ARB_ID
NEXT_PUBLIC_DEFAULT_NETWORK=TESTNET
NEXT_PUBLIC_TESTNET_RPC_URL=https://soroban-testnet.stellar.org
EOF

echo ""
echo "=== Deployment Completed Successfully ==="
echo "Escrow Contract:       $ESCROW_ID"
echo "Arbitration Contract:  $ARB_ID"
echo "Explorer Escrow:       https://stellar.expert/explorer/testnet/contract/$ESCROW_ID"
echo "Explorer Arbitration:  https://stellar.expert/explorer/testnet/contract/$ARB_ID"
