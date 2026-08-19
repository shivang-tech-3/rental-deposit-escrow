"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEscrow } from "@/hooks/useEscrow";
import { useWallet } from "@/hooks/useWallet";
import { EscrowCard } from "@/components/escrow/EscrowCard";
import { EscrowAgreement } from "@/types/escrow";
import {
  Layers,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { address, isConnected } = useWallet();
  const { escrows, loadAllEscrows, isLoading } = useEscrow();

  const [filterRole, setFilterRole] = useState<"all" | "landlord" | "tenant">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Demo fallback mock escrows if contract is fresh or uninitialized
  const demoEscrows: EscrowAgreement[] = [
    {
      id: 101,
      landlord: address || "GD6W5J...LANDLORD1",
      tenant: "GB7X2M...TENANT1",
      token: "USDC (CBIELTK...)",
      depositAmount: "1200.00",
      depositAmountRaw: "12000000000",
      inspectionSeconds: 86400 * 7,
      checkoutTimestamp: 0,
      arbiterContract: "CBVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      status: "Funded",
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 14,
    },
    {
      id: 102,
      landlord: "GA4Z9Y...LANDLORD2",
      tenant: address || "GC9K1P...TENANT2",
      token: "XLM (Native)",
      depositAmount: "3500.00",
      depositAmountRaw: "35000000000",
      inspectionSeconds: 86400 * 5,
      checkoutTimestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
      arbiterContract: "CBVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      status: "CheckoutInitiated",
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
    },
    {
      id: 103,
      landlord: "GD6W5J...LANDLORD1",
      tenant: "GC3T5V...TENANT3",
      token: "USDC (CBIELTK...)",
      depositAmount: "850.00",
      depositAmountRaw: "8500000000",
      inspectionSeconds: 86400 * 3,
      checkoutTimestamp: 0,
      arbiterContract: "CBVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      status: "Created",
      createdAt: Math.floor(Date.now() / 1000) - 3600,
    },
  ];

  const allList = escrows.length > 0 ? escrows : demoEscrows;

  const filteredEscrows = allList.filter((e) => {
    if (filterRole === "landlord" && address && e.landlord.toLowerCase() !== address.toLowerCase()) {
      return false;
    }
    if (filterRole === "tenant" && address && e.tenant.toLowerCase() !== address.toLowerCase()) {
      return false;
    }
    if (filterStatus !== "all" && e.status !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.id.toString().includes(q) ||
        e.landlord.toLowerCase().includes(q) ||
        e.tenant.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalLocked = allList
    .filter((e) => e.status === "Funded" || e.status === "CheckoutInitiated")
    .reduce((acc, curr) => acc + parseFloat(curr.depositAmount), 0);

  const activeEscrowsCount = allList.filter(
    (e) => e.status === "Funded" || e.status === "CheckoutInitiated"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2.5">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Rental Escrow Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your on-chain lease security deposits, inspections, and refunds
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadAllEscrows()}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/create"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Lease Escrow</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Value Locked</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">
              ${totalLocked.toLocaleString()}{" "}
              <span className="text-xs font-normal text-cyan-400">USDC</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Leases</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">
              {activeEscrowsCount}{" "}
              <span className="text-xs font-normal text-purple-400">Agreements</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Dispute Protection</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">
              100% <span className="text-xs font-normal text-emerald-400">Arbiter Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(["all", "landlord", "tenant"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                  filterRole === role
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="Created">Created (Unfunded)</option>
            <option value="Funded">Funded (Locked)</option>
            <option value="CheckoutInitiated">Checkout Active</option>
            <option value="Disputed">In Dispute</option>
            <option value="Released">Released</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID or Address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Escrow Cards Grid */}
      {filteredEscrows.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No Escrows Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No rental agreements match your current filter criteria. Create a new lease to get started.
          </p>
          <div>
            <Link
              href="/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Agreement</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEscrows.map((escrow) => (
            <EscrowCard key={escrow.id} escrow={escrow} />
          ))}
        </div>
      )}
    </div>
  );
}
