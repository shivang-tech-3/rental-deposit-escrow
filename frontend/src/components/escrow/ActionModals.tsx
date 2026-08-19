"use client";

import { useState } from "react";
import { X, AlertTriangle, UploadCloud, Loader2 } from "lucide-react";
import { IpfsService } from "@/services/ipfs";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: string;
  onSubmit: (claimAmount: string, reason: string, evidenceCid: string) => Promise<void>;
}

export function DisputeModal({ isOpen, onClose, maxAmount, onSubmit }: DisputeModalProps) {
  const [claimAmount, setClaimAmount] = useState("");
  const [reason, setReason] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimAmount || !reason) return;

    try {
      setIsSubmitting(true);
      // Upload evidence metadata to IPFS
      const { cid } = await IpfsService.uploadEvidence({
        title: `Dispute Claim: ${reason}`,
        description: evidenceText,
        files: [],
        uploadedBy: "Party",
        timestamp: Date.now(),
      });

      await onSubmit(claimAmount, reason, cid);
      onClose();
    } catch (err) {
      console.error("Dispute submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-glow max-w-md w-full rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-rose-400 mb-4">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Raise Escrow Dispute</h3>
            <p className="text-xs text-slate-400">Escalate to decentralized arbitration</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Claim Amount (Max: {maxAmount} XLM/USDC)
            </label>
            <input
              type="number"
              step="any"
              max={maxAmount}
              required
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Reason for Dispute</label>
            <input
              type="text"
              required
              maxLength={30}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Wall damage, Unpaid utilities"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Evidence Notes & Description (IPFS Hashed)
            </label>
            <textarea
              rows={3}
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              placeholder="Provide photos description, inspection checklist references, and proof..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-lg shadow-rose-600/30"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              <span>Submit Dispute</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
