"use client";

import Link from "next/link";
import { EscrowAgreement, EscrowStatus } from "@/types/escrow";
import { useWallet } from "@/hooks/useWallet";
import { Shield, Clock, ArrowRight, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import { clsx } from "clsx";

interface EscrowCardProps {
  escrow: EscrowAgreement;
}

export function EscrowCard({ escrow }: EscrowCardProps) {
  const { address } = useWallet();

  const isLandlord = address?.toLowerCase() === escrow.landlord.toLowerCase();
  const isTenant = address?.toLowerCase() === escrow.tenant.toLowerCase();

  const getStatusBadge = (status: EscrowStatus) => {
    switch (status) {
      case "Created":
        return {
          label: "Awaiting Deposit",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: Clock,
        };
      case "Funded":
        return {
          label: "Deposit Locked (Active)",
          color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          icon: Lock,
        };
      case "CheckoutInitiated":
        return {
          label: "Inspection Countdown",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          icon: Clock,
        };
      case "Disputed":
        return {
          label: "In Arbitration",
          color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: AlertTriangle,
        };
      case "Released":
        return {
          label: "Completed & Refunded",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: CheckCircle,
        };
      case "Resolved":
        return {
          label: "Arbiter Resolved",
          color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
          icon: Shield,
        };
      default:
        return {
          label: status,
          color: "bg-slate-500/10 text-slate-400 border-slate-500/30",
          icon: Clock,
        };
    }
  };

  const badge = getStatusBadge(escrow.status);
  const StatusIcon = badge.icon;

  const shorten = (addr: string) => `${addr.substring(0, 5)}...${addr.substring(addr.length - 4)}`;

  return (
    <div className="glass-panel p-5 rounded-2xl hover:border-cyan-500/40 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40">
            Escrow #{escrow.id}
          </span>
          {isLandlord && (
            <span className="text-[10px] bg-purple-950/70 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/50">
              Landlord
            </span>
          )}
          {isTenant && (
            <span className="text-[10px] bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50">
              Tenant
            </span>
          )}
        </div>

        <div className={clsx("flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs border font-medium", badge.color)}>
          <StatusIcon className="w-3 h-3" />
          <span>{badge.label}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold text-slate-100 flex items-baseline space-x-1.5">
          <span>{escrow.depositAmount}</span>
          <span className="text-xs text-cyan-400 font-mono">XLM/USDC</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Rental Security Deposit</p>
      </div>

      <div className="mt-5 space-y-2 text-xs border-t border-slate-800/60 pt-3 text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-500">Landlord:</span>
          <span className="font-mono text-slate-300">{shorten(escrow.landlord)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Tenant:</span>
          <span className="font-mono text-slate-300">{shorten(escrow.tenant)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Inspection Window:</span>
          <span className="text-slate-300">{Math.round(escrow.inspectionSeconds / 86400)} Days</span>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          Created: {new Date(escrow.createdAt * 1000).toLocaleDateString()}
        </span>

        <Link
          href={`/escrow/${escrow.id}`}
          className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
