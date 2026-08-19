"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Lock,
  Scale,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  const [depositAmount, setDepositAmount] = useState(1500);
  const [inspectionDays, setInspectionDays] = useState(7);

  const traditionalFee = (depositAmount * 0.04).toFixed(2);
  const stellarFee = (0.00001).toFixed(5);
  const savings = (depositAmount * 0.04 - 0.00001).toFixed(2);

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-medium text-cyan-300 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Powered by Stellar Soroban Smart Contracts</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Trustless Rental Deposits.{" "}
          <span className="text-gradient">Zero Landlord Fraud.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Lock rental security deposits on-chain with automatic timelocked releases,
          dispute-free checkout guarantees, and transparent decentralized arbitration.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/create"
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>Create New Lease</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold backdrop-blur-md transition-all"
          >
            <span>View Escrows</span>
          </Link>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-2xl font-bold text-cyan-400">100%</div>
            <div className="text-xs text-slate-400 mt-1">Non-Custodial</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-2xl font-bold text-purple-400">0.00001 XLM</div>
            <div className="text-xs text-slate-400 mt-1">Avg Gas Cost</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-2xl font-bold text-amber-400">&lt; 5s</div>
            <div className="text-xs text-slate-400 mt-1">Finality Speed</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-2xl font-bold text-emerald-400">Auto-Release</div>
            <div className="text-xs text-slate-400 mt-1">Inspection Timelock</div>
          </div>
        </div>
      </section>

      {/* Interactive Savings & Timelock Simulator */}
      <section className="glass-panel-glow p-8 rounded-3xl max-w-4xl mx-auto relative overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100">Interactive Deposit & Timelock Simulator</h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare on-chain Soroban escrow against traditional escrow middleman fees
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-slate-300">Monthly / Security Deposit Amount</span>
                <span className="text-cyan-400 font-mono font-bold">${depositAmount} USDC</span>
              </div>
              <input
                type="range"
                min="200"
                max="10000"
                step="100"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-slate-300">Inspection & Checkout Window</span>
                <span className="text-purple-400 font-mono font-bold">{inspectionDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={inspectionDays}
                onChange={(e) => setInspectionDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Traditional Escrow Fee (3-5%):</span>
                <span className="text-rose-400 font-mono">${traditionalFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stellar Soroban Network Fee:</span>
                <span className="text-emerald-400 font-mono font-bold">${stellarFee}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-semibold">
                <span className="text-slate-200">You Save:</span>
                <span className="text-cyan-400 font-mono">${savings}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Timelock Guarantees</span>
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deposit funds are locked in the Soroban smart contract instance.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Landlord has exactly <strong className="text-slate-200">{inspectionDays} days</strong> after checkout to verify property condition.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  If no dispute is submitted within {inspectionDays} days, tenant triggers instant 100% auto-release.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-100">How Stellar Escrow Works</h2>
          <p className="text-sm text-slate-400">Four simple, automated, and tamper-proof steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              1
            </div>
            <h3 className="text-base font-semibold text-slate-100">Create Lease</h3>
            <p className="text-xs text-slate-400">
              Landlord and tenant define deposit amount, inspection window, and assigned arbiter contract.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              2
            </div>
            <h3 className="text-base font-semibold text-slate-100">Lock Deposit</h3>
            <p className="text-xs text-slate-400">
              Tenant transfers deposit into the non-custodial Soroban contract via Freighter or StellarWalletsKit.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              3
            </div>
            <h3 className="text-base font-semibold text-slate-100">Checkout & Timelock</h3>
            <p className="text-xs text-slate-400">
              At lease end, checkout notice is submitted on-chain, initiating the strict inspection timer.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              4
            </div>
            <h3 className="text-base font-semibold text-slate-100">Release or Arbitrate</h3>
            <p className="text-xs text-slate-400">
              Instant refund is confirmed by landlord, auto-released on timeout, or settled via cross-contract arbitration.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-panel-glow p-10 rounded-3xl text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-100">Ready to secure your next lease?</h2>
        <p className="text-sm text-slate-400">
          Deploy an escrow agreement on Stellar Testnet in seconds with zero platform commission.
        </p>
        <div>
          <Link
            href="/create"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold shadow-xl shadow-cyan-500/25 transition-all"
          >
            <span>Launch Lease Escrow Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
