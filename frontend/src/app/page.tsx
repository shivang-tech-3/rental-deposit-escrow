"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Lock,
  Scale,
  ArrowRight,
  CheckCircle,
  Clock,
  ExternalLink,
  Coins,
  Cpu,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const [depositAmount, setDepositAmount] = useState(1500);
  const [inspectionDays, setInspectionDays] = useState(7);

  const traditionalFee = (depositAmount * 0.04).toFixed(2);
  const stellarFee = (0.00001).toFixed(5);
  const savings = (depositAmount * 0.04 - 0.00001).toFixed(2);

  return (
    <div className="space-y-28 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative max-w-5xl mx-auto">
        {/* Luminous Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-cyan-500/15 via-purple-600/20 to-amber-500/10 blur-[100px] -z-10 pointer-events-none rounded-full" />

        {/* Main Title with Prismatic Gradient */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] font-display">
          Trustless Rental Deposits.{" "}
          <span className="text-gradient">Zero Landlord Fraud.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Lock rental security deposits on-chain with automated timelocked releases,
          dispute-free checkout guarantees, and transparent decentralized arbitration.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/create"
            className="group flex items-center space-x-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>Create New Lease</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-7 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 font-semibold backdrop-blur-xl transition-all hover:border-slate-500 shadow-lg hover:shadow-cyan-500/10 active:scale-95"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>View Escrows</span>
          </Link>
        </div>

        {/* Highlight Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
          <div className="glass-panel glass-panel-interactive p-5 rounded-2xl text-center">
            <div className="text-3xl font-extrabold text-gradient-cyan">100%</div>
            <div className="text-xs font-medium text-slate-400 mt-1.5 uppercase tracking-wider">
              Non-Custodial
            </div>
          </div>
          <div className="glass-panel glass-panel-interactive p-5 rounded-2xl text-center">
            <div className="text-3xl font-extrabold text-gradient-purple">0.00001 XLM</div>
            <div className="text-xs font-medium text-slate-400 mt-1.5 uppercase tracking-wider">
              Avg Gas Cost
            </div>
          </div>
          <div className="glass-panel glass-panel-interactive p-5 rounded-2xl text-center">
            <div className="text-3xl font-extrabold text-gradient-gold">&lt; 5s</div>
            <div className="text-xs font-medium text-slate-400 mt-1.5 uppercase tracking-wider">
              Finality Speed
            </div>
          </div>
          <div className="glass-panel glass-panel-interactive p-5 rounded-2xl text-center">
            <div className="text-3xl font-extrabold text-gradient-emerald">Auto-Release</div>
            <div className="text-xs font-medium text-slate-400 mt-1.5 uppercase tracking-wider">
              Inspection Lock
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings & Timelock Simulator */}
      <section className="glass-panel-glow p-8 sm:p-10 rounded-3xl max-w-4xl mx-auto relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Coins className="w-4 h-4" />
            <span>Smart Simulation Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Interactive Deposit & Timelock Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Compare on-chain Soroban escrow against predatory middleman broker fees
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex justify-between text-xs font-medium mb-2.5">
                <span className="text-slate-300">Monthly / Security Deposit Amount</span>
                <span className="text-cyan-300 font-mono font-bold text-sm">
                  ${depositAmount.toLocaleString()} USDC
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="10000"
                step="100"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex justify-between text-xs font-medium mb-2.5">
                <span className="text-slate-300">Inspection & Checkout Window</span>
                <span className="text-purple-300 font-mono font-bold text-sm">
                  {inspectionDays} Days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={inspectionDays}
                onChange={(e) => setInspectionDays(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Traditional Escrow Fee (3-5%):</span>
                <span className="text-rose-400 font-mono font-semibold">${traditionalFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stellar Soroban Network Fee:</span>
                <span className="text-emerald-400 font-mono font-bold">${stellarFee}</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2.5 flex justify-between text-sm font-bold">
                <span className="text-slate-200">You Save:</span>
                <span className="text-cyan-300 font-mono text-base">${savings}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Smart Timelock Guarantees</span>
            </h3>

            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Deposit funds are secured inside an immutable Soroban smart contract escrow.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Landlord has exactly{" "}
                  <strong className="text-cyan-300 font-semibold">{inspectionDays} days</strong>{" "}
                  after checkout notice to review property condition.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  If no dispute is filed within {inspectionDays} days, the tenant can trigger
                  instant 100% auto-release.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="space-y-12 max-w-6xl mx-auto">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Architecture & Flow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
            How Stellar Escrow Works
          </h2>
          <p className="text-sm text-slate-300">
            Four simple, automated, and tamper-proof steps on Stellar Soroban
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel glass-panel-interactive p-6 rounded-2xl space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-base shadow-lg shadow-cyan-500/10">
              01
            </div>
            <h3 className="text-base font-bold text-slate-100">Create Lease</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Landlord and tenant configure deposit terms, inspection window, and designated arbiter.
            </p>
          </div>

          <div className="glass-panel glass-panel-interactive p-6 rounded-2xl space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-base shadow-lg shadow-purple-500/10">
              02
            </div>
            <h3 className="text-base font-bold text-slate-100">Lock Deposit</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tenant locks USDC deposit directly into the smart contract with cryptographic security.
            </p>
          </div>

          <div className="glass-panel glass-panel-interactive p-6 rounded-2xl space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-base shadow-lg shadow-amber-500/10">
              03
            </div>
            <h3 className="text-base font-bold text-slate-100">Checkout & Timer</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              At lease end, checkout is recorded on-chain, initiating the strict inspection timelock.
            </p>
          </div>

          <div className="glass-panel glass-panel-interactive p-6 rounded-2xl space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-base shadow-lg shadow-emerald-500/10">
              04
            </div>
            <h3 className="text-base font-bold text-slate-100">Release or Settle</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instant refund confirmed by landlord, auto-released on timeout, or arbitrated on-chain.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-panel-glow p-10 sm:p-12 rounded-3xl text-center space-y-6 max-w-3xl mx-auto relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
          Ready to secure your next lease?
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Deploy a non-custodial rental deposit escrow on Stellar Testnet in seconds with zero platform commission.
        </p>
        <div className="pt-2">
          <Link
            href="/create"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>Launch Lease Escrow Wizard</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
