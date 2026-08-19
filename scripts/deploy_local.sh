#!/usr/bin/env bash
set -e

echo "=== Deploying to Local Standalone Soroban Network ==="

stellar network add \
  --global local \
  --rpc-url "http://localhost:8000/soroban/rpc" \
  --network-passphrase "Standalone Network ; February 2017" || true

stellar keys generate --network local local_admin || true
ADMIN_ADDR=$(stellar keys address local_admin)

cargo build --target wasm32-unknown-unknown --release

ESCROW_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/rental_escrow.wasm \
  --source local_admin \
  --network local)

ARB_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/rental_arbitration.wasm \
  --source local_admin \
  --network local)

stellar contract invoke --id "$ESCROW_ID" --source local_admin --network local -- initialize --admin "$ADMIN_ADDR"
stellar contract invoke --id "$ARB_ID" --source local_admin --network local -- initialize --admin "$ADMIN_ADDR"

echo "Local Escrow ID: $ESCROW_ID"
echo "Local Arbiter ID: $ARB_ID"
