"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEscrow } from "@/hooks/useEscrow";
import { useArbitration } from "@/hooks/useArbitration";
import { useWallet } from "@/hooks/useWallet";
import { EscrowAgreement, EscrowStatus } from "@/types/escrow";
import { EscrowTimeline } from "@/components/escrow/EscrowTimeline";
import { DisputeModal } from "@/components/escrow/ActionModals";
import {
  ShieldCheck,
  Clock,
  Coins,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";

export default function EscrowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const escrowId = Number(params?.id || 1);

  const { address, isConnected, connect, networkConfig } = useWallet();
  const {
    loadEscrow,
    depositFunds,
    initiateCheckout,
    confirmRelease,
    claimAutoRelease,
    raiseDispute,
  } = useEscrow();
  const { openDispute } = useArbitration();

  const [escrow, setEscrow] = useState<EscrowAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      const res = await loadEscrow(escrowId);
      if (res) {
        setEscrow(res);
      } else {
        // Fallback demo state for testing/mock
        setEscrow({
          id: escrowId,
          landlord: "GD6W5J4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF",
          tenant: address || "GB7X2M9P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF",
          token: "USDC (CBIELTK6YBZJU5UP...)",
          depositAmount: "1500.00",
          depositAmountRaw: "15000000000",
          inspectionSeconds: 86400 * 7,
          checkoutTimestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
          arbiterContract: networkConfig.arbitrationContractId,
          status: "Funded",
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
        });
      }
      setLoading(false);
    }
    fetchDetails();
  }, [escrowId, loadEscrow, address, networkConfig]);

  if (loading || !escrow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-400">Loading Soroban Escrow #{escrowId}...</span>
      </div>
    );
  }

  const isLandlord = address?.toLowerCase() === escrow.landlord.toLowerCase();
  const isTenant = address?.toLowerCase() === escrow.tenant.toLowerCase();

  const nowSecs = Math.floor(Date.now() / 1000);
  const inspectionDeadline = escrow.checkoutTimestamp + escrow.inspectionSeconds;
  const isAutoReleaseReady =
    escrow.status === "CheckoutInitiated" && nowSecs >= inspectionDeadline;
  const remainingSeconds = Math.max(0, inspectionDeadline - nowSecs);
  const remainingDays = Math.floor(remainingSeconds / 86400);
  const remainingHours = Math.floor((remainingSeconds % 86400) / 3600);

  const handleDeposit = async () => {
    setActionLoading(true);
    try {
      await depositFunds(escrow.id, escrow.depositAmount);
      setEscrow({ ...escrow, status: "Funded" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async () => {
    setActionLoading(true);
    try {
      await initiateCheckout(escrow.id);
      setEscrow({
        ...escrow,
        status: "CheckoutInitiated",
        checkoutTimestamp: Math.floor(Date.now() / 1000),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    setActionLoading(true);
    try {
      await confirmRelease(escrow.id);
      setEscrow({ ...escrow, status: "Released" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoRelease = async () => {
    setActionLoading(true);
    try {
      await claimAutoRelease(escrow.id);
      setEscrow({ ...escrow, status: "Released" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisputeSubmit = async (claimAmount: string, reason: string, evidenceCid: string) => {
    setActionLoading(true);
    try {
      await raiseDispute(escrow.id, claimAmount, reason);
      await openDispute(
        networkConfig.escrowContractId,
        escrow.id,
        escrow.arbiterContract,
        claimAmount,
        evidenceCid
      );
      setEscrow({ ...escrow, status: "Disputed" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Back navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Escrows</span>
      </button>

      {/* Header Card */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/60 font-semibold">
                Escrow #{escrow.id}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                {escrow.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Lease Security Deposit</h1>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-3xl font-extrabold text-cyan-300 font-mono">
              {escrow.depositAmount} <span className="text-xs text-slate-400 font-normal">USDC/XLM</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Held on Stellar Soroban Contract</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t border-b border-slate-800/80 py-4">
          <EscrowTimeline
            status={escrow.status}
            checkoutTimestamp={escrow.checkoutTimestamp}
            inspectionSeconds={escrow.inspectionSeconds}
          />
        </div>

        {/* Inspection countdown banner if in Checkout */}
        {escrow.status === "CheckoutInitiated" && (
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-purple-300">
              <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-semibold">Inspection Window Active</h4>
                <p className="text-[11px] text-purple-200/70">
                  {isAutoReleaseReady
                    ? "Inspection period elapsed! Tenant can claim auto-release."
                    : `Time remaining: ${remainingDays}d ${remainingHours}h before auto-release unlocks.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Agreement Details Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 font-medium">Landlord Address:</span>
            <div className="font-mono text-slate-300 break-all">{escrow.landlord}</div>
          </div>
          <div className="space-y-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 font-medium">Tenant Address:</span>
            <div className="font-mono text-slate-300 break-all">{escrow.tenant}</div>
          </div>
          <div className="space-y-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 font-medium">Inspection Window:</span>
            <div className="text-slate-300 font-medium">
              {Math.round(escrow.inspectionSeconds / 86400)} Days
            </div>
          </div>
          <div className="space-y-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 font-medium">Arbiter Contract:</span>
            <div className="font-mono text-slate-300 break-all">{escrow.arbiterContract}</div>
          </div>
        </div>

        {/* Interactive Action Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {isConnected ? (
              <span>
                Connected as: <strong className="text-cyan-300">{isLandlord ? "Landlord" : isTenant ? "Tenant" : "Observer"}</strong>
              </span>
            ) : (
              <span>Connect wallet to perform actions</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isConnected && (
              <button
                onClick={connect}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs"
              >
                Connect Wallet
              </button>
            )}

            {/* Tenant Deposit Button */}
            {isConnected && escrow.status === "Created" && (
              <button
                onClick={handleDeposit}
                disabled={actionLoading}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Deposit {escrow.depositAmount} XLM/USDC</span>
              </button>
            )}

            {/* Initiate Checkout Button */}
            {isConnected && escrow.status === "Funded" && (
              <button
                onClick={handleCheckout}
                disabled={actionLoading}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                <span>Initiate Checkout Notice</span>
              </button>
            )}

            {/* Landlord Direct Release */}
            {isConnected && (escrow.status === "Funded" || escrow.status === "CheckoutInitiated") && isLandlord && (
              <button
                onClick={handleRelease}
                disabled={actionLoading}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Release 100% Deposit to Tenant</span>
              </button>
            )}

            {/* Tenant Auto-Release Trigger */}
            {isConnected && escrow.status === "CheckoutInitiated" && (
              <button
                onClick={handleAutoRelease}
                disabled={actionLoading || !isAutoReleaseReady}
                className={clsx(
                  "flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition",
                  isAutoReleaseReady
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                <span>Claim Auto-Release</span>
              </button>
            )}

            {/* Raise Dispute Button */}
            {isConnected && (escrow.status === "Funded" || escrow.status === "CheckoutInitiated") && (
              <button
                onClick={() => setIsDisputeModalOpen(true)}
                disabled={actionLoading}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Raise Dispute</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        maxAmount={escrow.depositAmount}
        onSubmit={handleDisputeSubmit}
      />
    </div>
  );
}
