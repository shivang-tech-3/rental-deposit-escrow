# StellarVault — Startup Idea Submission

> **Tagline:** Non-Custodial Rental Deposit Escrow & Decentralized Dispute Resolution on Stellar Soroban.

---

## 1. Problem Statement
**What real problem are you solving?**

Residential and commercial rental security deposits represent an estimated **$150B+ global locked liquidity pool**, yet the traditional process is fraught with friction, distrust, and systemic inefficiencies:

1. **Security Deposit Theft & Landlord Bad-Faith Withholding:**
   - Over **35% of tenants** experience partial or total deposit retention without transparent receipts or legitimate damage justification.
   - Traditional dispute mechanisms require small claims court, costing more in legal fees and months of time than the deposit itself.
2. **Locked, Non-Yielding Capital Friction:**
   - Tenants must lock up 1–3 months of rent in opaque landlord bank accounts with zero visibility, zero cryptographic guarantees, and zero yield.
3. **Legacy Escrow Middlemen Exorbitance:**
   - Existing escrow services charge **3%–6% intermediary fees**, have multi-day settlement delays, and require manual human intervention for fund release.
4. **Cross-Border / Expat Housing Barriers:**
   - International students, digital nomads, and expats face exorbitant wire fees, banking friction, and currency conversion losses just to secure an apartment lease.

**StellarVault solves this** by replacing opaque landlord bank accounts with trustless, non-custodial Soroban smart contract escrows with automated inspection timelocks and decentralized on-chain arbitration.

---

## 2. Why Stellar?
**Why does this make sense on Stellar specifically?**

Stellar and the Soroban smart contract platform offer unique architectural advantages that make this use case viable where Ethereum, Solana, or traditional banking fail:

* **Sub-Cent Micro-Fees (~0.00001 XLM / < $0.0001 per tx):**
  - Essential for automated timelock triggers, evidence submissions, and multi-signature release workflows without eating into user deposits (unlike Ethereum L1/L2 gas spikes).
* **Deterministic Sub-5s Finality:**
  - Guarantees immediate lease creation, instantaneous deposit confirmation, and real-time checkout payouts.
* **Native Stablecoin Ecosystem (USDC on Stellar):**
  - Renters and landlords demand fiat-pegged price stability. Regulated USDC issued natively on Stellar eliminates crypto volatility risk for long-term rental agreements.
* **Soroban Rust Contract Architecture & Cross-Contract Security:**
  - Soroban's robust Rust-based type safety, isolated state footprint, and reentrancy protections provide the institutional-grade security required for holding custody-free real-world assets.
* **Built-in Global Ramp / Anchor Network:**
  - Stellar's worldwide anchor network (e.g., MoneyGram Access) enables seamless fiat-to-USDC on/off-ramps for real-world tenants and landlords without needing prior crypto exchange accounts.

---

## 3. Target Users
**Who will use this?**

1. **Tenants (Residential & Commercial Renters):**
   - Individuals, university students, and remote workers who want absolute assurance that their security deposit will be automatically returned on time without unfair landlord withholding.
2. **Independent Landlords & Co-Living Operators:**
   - Property owners who want to offer frictionless, verified leases, attract premium tenants with cryptographic trust, and eliminate deposit compliance headaches.
3. **Property Management Companies & Rental Platforms:**
   - Short/mid-term rental platforms (e.g., sublets, Airbnb extended stays) seeking an automated API-driven escrow settlement rail.
4. **Decentralized Arbiters & Property Inspectors:**
   - Certified real estate arbiters and inspection DAOs who earn transparent protocol fees by reviewing cryptographically verifiable check-out evidence (photos, lease agreements via IPFS).

---

## 4. Technical Architecture
**Frontend + Contract + Data Flow**

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PRESENTATION LAYER (Next.js 15)                        │
│   • 3D WebGL Canvas (Three.js)        • Rental Creation Wizard     • Escrow Timeline   │
│   • Interactive Simulator             • Evidence Uploader (IPFS)   • Arbiter Console   │
└──────────────────────────┬──────────────────────────────────────────┬──────────────────┘
                           │                                          │
            StellarWalletsKit / Freighter                        Zustand & React Query
                           │                                          │
┌──────────────────────────▼──────────────────────────────────────────▼──────────────────┐
│                            SDK & CLIENT SERVICES (@stellar/stellar-sdk)                 │
│   • Typed EscrowClient (SAC Token Transfer / ScVal Encoding)                           │
│   • Typed ArbitrationClient (Cross-Contract Invocations)                                │
│   • Live RPC Event Streamer & Transaction Simulator                                     │
└──────────────────────────┬─────────────────────────────────────────────────────────────┘
                           │ RPC (HTTPS / WSS)
┌──────────────────────────▼─────────────────────────────────────────────────────────────┐
│                           SOROBAN SMART CONTRACT SUITE (Rust)                           │
│                                                                                         │
│   ┌─────────────────────────────────────┐   Cross-Contract    ┌─────────────────────┐   │
│   │        RentalEscrow Contract        │◄────────────────────│ Arbitration Contract│   │
│   ├─────────────────────────────────────┤    Invocations      ├─────────────────────┤   │
│   │ • create_escrow(...)                │                     │ • register_arbiter()│   │
│   │ • deposit() (SAC Token Lock)        │                     │ • open_dispute()    │   │
│   │ • initiate_checkout()               │                     │ • submit_evidence() │   │
│   │ • claim_auto_release() [Timelock]   │                     │ • issue_ruling()    │   │
│   │ • resolve_dispute()                 │                     │ • get_dispute()     │   │
│   └─────────────────────────────────────┘                     └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Flow:
1. **Agreement Creation:** Landlord creates an escrow specifying deposit amount (USDC), lease dates, inspection window (e.g., 7 days), and selected arbiter contract.
2. **Deposit & Lock:** Tenant signs via Freighter/StellarWalletsKit; funds transfer into the non-custodial `RentalEscrow` Soroban contract instance.
3. **Checkout & Timelock:** Upon move-out, `initiate_checkout` starts the on-chain inspection timer.
4. **Settlement Pathways:**
   - **Happy Path:** Landlord calls `release_deposit` $\rightarrow$ 100% instant refund.
   - **Timelock Expiry:** If landlord takes no action within the inspection window, tenant triggers `claim_auto_release` $\rightarrow$ smart contract automatically releases 100% funds back to tenant.
   - **Disputed Path:** Landlord/tenant raises a claim $\rightarrow$ invokes `RentalArbitration` with IPFS photo evidence CIDs $\rightarrow$ bonded arbiter reviews and triggers `resolve_dispute` cross-contract payout.

---

## 5. Complexity Evaluation
**What makes this technically challenging?**

1. **Non-Custodial Multi-Contract State Synchronization:**
   - Structuring secure, reentrancy-safe cross-contract calls between `RentalArbitration` and `RentalEscrow` using Soroban's authorization framework (`require_auth`).
2. **Decentralized Timelock Enforcement without Centralized Cron Keepers:**
   - Designing self-enforcing state machines using ledger ledger timestamps (`env.ledger().timestamp()`) allowing permissionless execution of auto-releases by either party once timelock conditions elapse.
3. **Stellar Asset Contract (SAC) & Allowance Handling:**
   - Handling token approvals, native SAC transfers, exact decimal scaling (`i128`), and multi-asset escrow compatibility (USDC, XLM).
4. **Real-time Event Streaming & Optimistic UI Updates:**
   - Ingesting and decoding Soroban RPC topic events to maintain sub-second UI timeline state transitions without continuous blocking polling.
5. **Decentralized Evidence Integrity:**
   - Storing immutable photographic check-in and check-out evidence on IPFS hashed onto Soroban contract state, ensuring tamper-proof dispute adjudications.

---

## 6. Roadmap

### Phase 1: MVP (Completed & Live)
- [x] Dual Soroban Rust contracts (`RentalEscrow` + `RentalArbitration`) with 100% passing test suite.
- [x] Full Next.js 15 web application with 3D interactive WebGL interface.
- [x] StellarWalletsKit integration (Freighter, xBull, Albedo, Lobstr) + 1-click Demo Sandbox.
- [x] Interactive Timelock & Escrow Fee Simulator.
- [x] CI/CD automated pipeline and live Netlify testnet deployment.

### Phase 2: User Acquisition & Go-To-Market (Months 1–4)
- **University Campus Ambassador Pilot:** Partner with student housing associations in major metropolitan cities (high deposit fraud concentration).
- **Zero-Fee Landlord Onboarding Campaign:** Enable landlords to generate verifiable StellarVault escrow links directly in lease agreements.
- **Anchor Integrations:** Embed fiat on-ramp widgets (MoneyGram / MoonPay) directly in the checkout flow so non-crypto native tenants can deposit using standard debit cards/Apple Pay.
- **Arbiter Bounty Program:** Onboard licensed real estate mediators with bonded staking pools to provide 24-hour dispute SLAs.

### Phase 3: Mainnet Vision & Protocol Expansion (Months 5–12)
- **Yield-Bearing Security Deposits:** Integrate Soroban DeFi lending protocols (e.g., Blend) to allow locked deposits to accrue low-risk yield split between tenant and landlord.
- **Decentralized Tenant Reputation Score (SBTs):** Issue Soulbound Stellar Badges for dispute-free lease completions, lowering future deposit requirements for trusted renters.
- **Property Management SaaS SDK:** Provide open-source npm packages and REST webhooks for existing prop-tech platforms (Buildium, AppFolio) to use StellarVault as their underlying escrow clearing rail.
