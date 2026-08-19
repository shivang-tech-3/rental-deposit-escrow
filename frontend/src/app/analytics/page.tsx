"use client";

import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Clock,
  Coins,
  Scale,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function AnalyticsPage() {
  const stats = [
    {
      title: "Total Value Locked (TVL)",
      value: "$2,450,800",
      change: "+18.4% this month",
      icon: Coins,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    {
      title: "Active Rental Escrows",
      value: "1,248",
      change: "+124 new leases",
      icon: ShieldCheck,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    },
    {
      title: "Dispute-Free Rate",
      value: "96.8%",
      change: "Only 3.2% escalated",
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      title: "Avg Resolution Time",
      value: "2.4 Days",
      change: "Fast decentralized arbitration",
      icon: Clock,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
  ];

  const monthlyVolume = [
    { month: "Jan", amount: 320, disputes: 8 },
    { month: "Feb", amount: 480, disputes: 12 },
    { month: "Mar", amount: 620, disputes: 15 },
    { month: "Apr", amount: 890, disputes: 20 },
    { month: "May", amount: 1200, disputes: 24 },
    { month: "Jun", amount: 1650, disputes: 30 },
    { month: "Jul", amount: 2100, disputes: 42 },
    { month: "Aug", amount: 2450, disputes: 46 },
  ];

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2.5">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <span>Platform Analytics & Macro Metrics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          On-chain volume locked, escrow completion rates, and arbitration performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{s.title}</span>
                <div className={`p-2 rounded-xl border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-slate-100">{s.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{s.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Volume Bar Chart */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100">Monthly Volume Locked ($k USDC)</h2>
            <p className="text-xs text-slate-400">Continuous growth in on-chain rental security deposits</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/40">
            2026 YTD
          </span>
        </div>

        <div className="grid grid-cols-8 gap-3 items-end h-56 pt-8 pb-2 border-b border-slate-800">
          {monthlyVolume.map((item) => {
            const heightPercent = Math.round((item.amount / 2500) * 100);
            return (
              <div key={item.month} className="flex flex-col items-center space-y-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition">
                  ${item.amount}k
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-cyan-600 via-indigo-600 to-purple-500 opacity-80 group-hover:opacity-100 transition-all shadow-lg shadow-cyan-500/10"
                />
                <span className="text-xs text-slate-400 font-medium">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Gas Efficiency
          </div>
          <div className="text-xl font-bold text-slate-100">0.00001 XLM</div>
          <p className="text-xs text-slate-400">
            Soroban smart contract executions cost virtually zero compared to Ethereum L1/L2 solutions.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Automated Settlement
          </div>
          <div className="text-xl font-bold text-slate-100">89.2%</div>
          <p className="text-xs text-slate-400">
            Escrows complete automatically on dispute-free timelock expiration without friction.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Verified Arbiters
          </div>
          <div className="text-xl font-bold text-slate-100">18 Arbiters</div>
          <p className="text-xs text-slate-400">
            Decentralized network of bonded property managers and dispute mediators.
          </p>
        </div>
      </div>
    </div>
  );
}
