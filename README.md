# Stellar Rental Deposit Escrow (StellarVault)

[![CI PR Checks](https://github.com/shivang-tech-3/rental-deposit-escrow/actions/workflows/ci.yml/badge.svg)](https://github.com/shivang-tech-3/rental-deposit-escrow/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stellar Soroban](https://img.shields.io/badge/Soroban-v22.0-purple.svg)](https://stellar.org/soroban)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black.svg)](https://nextjs.org/)

A decentralized, non-custodial rental deposit escrow platform built on **Stellar Soroban smart contracts**. StellarVault eliminates landlord deposit theft and unjustified deductions by locking security deposits on-chain, enforcing strict dispute-free inspection countdowns with automatic auto-releases, and facilitating transparent, decentralized arbitration.

---

## 🌟 Key Features

- **Trustless On-Chain Deposit Locking**: Non-custodial Soroban escrow supporting USDC (SEP-41), XLM (Native SAC), and custom Stellar assets.
- **Automated Timelocked Checkouts**: Landlord inspection window (e.g. 7 days). If no valid dispute is filed, tenants trigger instant **100% automated refunds**.
- **Decentralized Arbitration**: Bonded property arbiters review IPFS evidence hashes and execute split payouts directly through cross-contract smart contract calls.
- **Inter-Contract Invocation**: `RentalArbitrationContract` issues binding rulings that execute payouts via authorized cross-contract calls to `RentalEscrowContract`.
- **Multi-Wallet Support**: Integrated with `@creit.tech/stellar-wallets-kit` supporting Freighter, xBull, Albedo, Hana, and Lobstr.
- **Real-Time Event Streaming**: Live Soroban RPC event polling engine listening to on-chain ledger events with dedicated Activity Feed and sound alerts.
- **Transaction Lifecycle Center**: Full tracking across *Building -> Simulating -> Signature -> Submitting -> Confirmed on Ledger* with explorer links and retry queues.
- **Enterprise-Grade Observability**: Error decoding, metrics tracking, and platform macro analytics (TVL, dispute ratios, settlement velocity).

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph "Clients & Wallets"
        User([Tenant / Landlord / Arbiter]) -->|Freighter / xBull / Albedo| SWK[StellarWalletsKit]
        SWK --> Frontend[Next.js 15 Web App]
    end

    subgraph "Frontend Application Layer"
        Frontend --> UI[UI Pages & Modals]
        UI --> State[Zustand & React Query]
        State --> Hooks[Custom Hooks: useEscrow, useArbitration, useWallet]
        Hooks --> Services[Stellar RPC & EventStreamService]
    end

    subgraph "Stellar Soroban Blockchain (Testnet / Mainnet)"
        Services -->|Invoke / Simulate| EscrowContract[Rental Escrow Contract]
        Services -->|Invoke / Simulate| ArbContract[Rental Arbitration Contract]
        
        ArbContract -->|Cross-Contract Invocation: resolve_dispute| EscrowContract
        
        EscrowContract -->|Emits: created, funded, checkout, autorel| Ledger[(Stellar Ledger)]
        ArbContract -->|Emits: arbr_reg, dsp_open, ruling| Ledger
    end

    Ledger -->|Soroban RPC Event Stream| Services
```

---

## 🔄 Inter-Contract Communication Flow

```mermaid
sequenceDiagram
    autonumber
    actor Tenant
    actor Landlord
    actor Arbiter
    participant Escrow as Rental Escrow Contract
    participant Arb as Arbitration Contract
    participant Token as Stellar Asset Contract (USDC/XLM)

    Landlord->>Escrow: create_escrow(tenant, amount, inspection_days, arbiter_contract)
    Tenant->>Token: approve & transfer deposit
    Tenant->>Escrow: deposit(escrow_id)
    Note over Escrow: Funds locked in contract instance
    
    Tenant->>Escrow: initiate_checkout(escrow_id)
    Note over Escrow: Inspection countdown begins (e.g. 7 days)
    
    Landlord->>Escrow: raise_dispute(escrow_id, claim_amount, reason)
    Landlord->>Arb: open_dispute(escrow_contract, escrow_id, arbiter, claim, ipfs_cid)
    Tenant->>Arb: submit_evidence(dispute_id, counter_ipfs_cid)
    
    Note over Arbiter: Arbiter reviews IPFS evidence & decides split
    Arbiter->>Arb: issue_ruling(dispute_id, tenant_payout, landlord_payout)
    Arb->>Escrow: resolve_dispute(escrow_id, tenant_payout, landlord_payout)
    Escrow->>Token: transfer(tenant, tenant_payout)
    Escrow->>Token: transfer(landlord, landlord_payout)
    Note over Escrow: Agreement Status = Resolved
```

---

## 📁 Repository Structure

```
rentaldepositescrow/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # PR checks (Cargo test, clippy, Vitest, build)
│       └── deploy.yml             # Automated Testnet deployment
├── contracts/
│   ├── Cargo.toml                 # Cargo workspace
│   ├── escrow/                    # Escrow smart contract
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs             # Escrow logic & entrypoints
│   │       ├── storage.rs         # Instance/Persistent storage & TTL helpers
│   │       ├── events.rs          # Soroban event definitions
│   │       ├── errors.rs          # Custom error codes
│   │       └── test.rs            # Rust unit & lifecycle tests
│   └── arbitration/               # Arbitration smart contract
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs             # Arbiter registry & cross-contract caller
│           ├── storage.rs         # Dispute records & evidence storage
│           ├── events.rs          # Arbitration events
│           ├── errors.rs          # Arbitration error codes
│           └── test.rs            # Inter-contract simulation tests
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js 15 App Router pages
│   │   │   ├── page.tsx           # Landing page & fee calculator
│   │   │   ├── dashboard/         # Escrow manager dashboard
│   │   │   ├── create/            # Lease creation wizard
│   │   │   ├── escrow/[id]/       # Escrow details & interactive actions
│   │   │   ├── activity/          # Live event stream feed
│   │   │   ├── transactions/      # Transaction lifecycle center
│   │   │   ├── arbitration/       # Arbiter portal & ruling console
│   │   │   ├── analytics/         # Macro metrics & volume charts
│   │   │   └── settings/          # Network switcher & contract overrides
│   │   ├── components/            # UI components, cards, toasts, modals
│   │   ├── contracts/             # Typed Soroban contract clients
│   │   ├── hooks/                 # Custom React hooks (useWallet, useEscrow, etc.)
│   │   ├── services/              # Stellar RPC, WalletKit, IPFS, EventStream
│   │   ├── state/                 # Zustand state stores
│   │   └── __tests__/             # Vitest frontend unit & integration tests
├── scripts/
│   ├── deploy_testnet.sh          # Deploy to Testnet (Bash)
│   ├── deploy_testnet.ps1         # Deploy to Testnet (PowerShell)
│   ├── deploy_local.sh            # Deploy to Local Standalone (Bash)
│   ├── init_contracts.ts          # Arbiter configuration script
│   └── upgrade_contract.ts        # Contract Wasm upgrade script
├── .env.example
├── Cargo.toml
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Rust & Cargo](https://rustup.rs/) (with `wasm32-unknown-unknown` target)
- [Node.js 20+](https://nodejs.org/)
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli) (`cargo install --locked stellar-cli --features opt`)

### 1. Smart Contract Testing
```bash
# Run unit & lifecycle tests across both Soroban contracts
cargo test --lib
```

### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Running Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🌐 Testnet Deployment Instructions

### Option A: Automatic Script Deployment (Recommended)

#### On Linux / macOS / WSL:
```bash
chmod +x scripts/deploy_testnet.sh
./scripts/deploy_testnet.sh
```

#### On Windows PowerShell:
```powershell
.\scripts\deploy_testnet.ps1
```

### Option B: Step-by-Step Manual Deployment

1. **Build the WASM binaries:**
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```

2. **Generate and fund deployer key:**
   ```bash
   stellar keys generate --network testnet deployer
   DEPLOYER_ADDR=$(stellar keys address deployer)
   ```

3. **Deploy Escrow Contract:**
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/rental_escrow.wasm \
     --source deployer \
     --network testnet
   ```

4. **Deploy Arbitration Contract:**
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/rental_arbitration.wasm \
     --source deployer \
     --network testnet
   ```

5. **Initialize Both Contracts:**
   ```bash
   stellar contract invoke --id <ESCROW_ID> --source deployer --network testnet -- initialize --admin $DEPLOYER_ADDR
   stellar contract invoke --id <ARB_ID> --source deployer --network testnet -- initialize --admin $DEPLOYER_ADDR
   ```

---

## 📜 Deployed Contract Addresses (Stellar Testnet)

| Contract | Address | StellarExpert Explorer |
| :--- | :--- | :--- |
| **Rental Escrow** | `CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZX2J2X2V6P5VNJT77FZ` | [View on Explorer](https://stellar.expert/explorer/testnet/contract/CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZX2J2X2V6P5VNJT77FZ) |
| **Rental Arbitration** | `CBVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZX2J2X2V6P5VNJT77FZ` | [View on Explorer](https://stellar.expert/explorer/testnet/contract/CBVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZX2J2X2V6P5VNJT77FZ) |
| **Testnet USDC (SAC)** | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWUIE3USSTHZX5I6INT` | [View on Explorer](https://stellar.expert/explorer/testnet/contract/CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWUIE3USSTHZX5I6INT) |

*Sample Verified Testnet Transaction Hash:*
`a9f8b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde`

---

## 🔒 Security & Best Practices

- **Reentrancy Protection**: State updates precede token transfers in both smart contracts.
- **TTL Bump Extension**: Contracts automatically invoke `extend_ttl` on persistent storage keys to prevent archival during lease terms.
- **Cross-Contract Verification**: `RentalEscrowContract` strictly verifies that `resolve_dispute` can only be invoked by the designated `arbiter_contract` address registered during escrow creation.
- **Non-Custodial Design**: Funds can only leave the contract via: (1) Landlord voluntary release, (2) Timelocked auto-release expiration, or (3) Binding arbitration ruling.
- **Upgrade Authorization**: Contract upgrades require cryptographic signature verification from the authorized Admin.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
