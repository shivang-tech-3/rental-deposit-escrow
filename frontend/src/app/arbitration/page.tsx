"use client";

import { useState } from "react";
import { useArbitration } from "@/hooks/useArbitration";
import { useWallet } from "@/hooks/useWallet";
import { DisputeRecord } from "@/types/arbitration";
import {
  Scale,
  ShieldAlert,
  FileText,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function ArbitrationPage() {
  const { address, isConnected, connect } = useWallet();
  const { disputes, issueRuling } = useArbitration();

  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);
  const [tenantSplitPercent, setTenantSplitPercent] = useState<number>(60);
  const [isRulingSubmitting, setIsRulingSubmitting] = useState<boolean>(false);

  const demoDisputes: DisputeRecord[] = [
    {
      disputeId: 1,
      escrowContract: "CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      escrowId: 101,
      assignedArbiter: address || "G_ARBITER_OFFICIAL_STATION_1",
      claimant: "GD6W5J...LANDLORD1",
      initialClaimAmount: "500.00",
      evidenceHashes: [
        "ipfs://bafybeicid_wall_paint_scratches_photo1",
        "ipfs://bafybeicid_moveout_cleaning_invoice_receipt",
      ],
      status: "EvidenceCollection",
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
      resolvedAt: 0,
      tenantPayout: "0",
      landlordPayout: "0",
    },
    {
      disputeId: 2,
      escrowContract: "CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      escrowId: 88,
      assignedArbiter: address || "G_ARBITER_OFFICIAL_STATION_1",
      claimant: "GC3T5V...TENANT",
      initialClaimAmount: "1200.00",
      evidenceHashes: ["ipfs://bafybeicid_key_return_receipt_and_clean_video"],
      status: "Ruled",
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 5,
      resolvedAt: Math.floor(Date.now() / 1000) - 86400 * 1,
      tenantPayout: "1000.00",
      landlordPayout: "200.00",
    },
  ];

  const allDisputes = disputes.length > 0 ? disputes : demoDisputes;
  const activeDispute = selectedDispute || allDisputes[0];

  const totalDeposit = 1200; // Reference deposit pool for calculation
  const tenantPayoutCalc = ((totalDeposit * tenantSplitPercent) / 100).toFixed(2);
  const landlordPayoutCalc = ((totalDeposit * (100 - tenantSplitPercent)) / 100).toFixed(2);

  const handleIssueRuling = async () => {
    if (!activeDispute) return;
    try {
      setIsRulingSubmitting(true);
      await issueRuling(
        activeDispute.disputeId,
        tenantPayoutCalc,
        landlordPayoutCalc
      );
    } finally {
      setIsRulingSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2.5">
          <Scale className="w-6 h-6 text-purple-400" />
          <span>Decentralized Arbitration Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review evidence hashes, adjust equitable payout splits, and execute cross-contract smart contract rulings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Case Queue */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dispute Cases ({allDisputes.length})
          </h2>

          <div className="space-y-2.5">
            {allDisputes.map((d) => (
              <div
                key={d.disputeId}
                onClick={() => setSelectedDispute(d)}
                className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all ${
                  activeDispute?.disputeId === d.disputeId
                    ? "border-purple-500/50 bg-slate-900/90 shadow-lg shadow-purple-900/20"
                    : "hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-300 font-semibold">
                    Case #{d.disputeId}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      d.status === "Ruled"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-200 mt-2">
                  Escrow #{d.escrowId} • Claim: {d.initialClaimAmount} XLM/USDC
                </div>

                <div className="text-[11px] text-slate-500 mt-1">
                  Evidence Items: {d.evidenceHashes.length}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 columns: Evidence Inspection & Ruling Console */}
        {activeDispute && (
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel-glow p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-100">
                      Case #{activeDispute.disputeId} Details
                    </span>
                    <span className="text-xs font-mono text-cyan-400">
                      Escrow #{activeDispute.escrowId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Claimant: <span className="font-mono text-slate-300">{activeDispute.claimant}</span>
                  </p>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400">Status:</span>
                  <div className="font-semibold text-purple-300">{activeDispute.status}</div>
                </div>
              </div>

              {/* Evidence Hashes (IPFS) */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>On-Chain Evidence Records (IPFS Hashes)</span>
                </h3>

                <div className="space-y-2">
                  {activeDispute.evidenceHashes.map((hash, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 font-mono text-slate-300">
                        <span className="text-slate-500">#{idx + 1}</span>
                        <span>{hash}</span>
                      </div>
                      <a
                        href={`https://ipfs.io/ipfs/${hash.replace("ipfs://", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ruling Split Simulator & Submission */}
              {activeDispute.status !== "Ruled" ? (
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-6">
                  <div className="flex items-center space-x-2 text-purple-300">
                    <Sliders className="w-4 h-4" />
                    <h3 className="text-sm font-semibold">Arbiter Allocation Slider</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-cyan-300">
                        Tenant Payout: {tenantSplitPercent}% ({tenantPayoutCalc} USDC)
                      </span>
                      <span className="text-purple-300">
                        Landlord Payout: {100 - tenantSplitPercent}% ({landlordPayoutCalc} USDC)
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={tenantSplitPercent}
                      onChange={(e) => setTenantSplitPercent(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleIssueRuling}
                      disabled={isRulingSubmitting}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
                    >
                      {isRulingSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Issue Binding Cross-Contract Ruling</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      Dispute Ruled: Tenant received {activeDispute.tenantPayout} USDC, Landlord received {activeDispute.landlordPayout} USDC
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
