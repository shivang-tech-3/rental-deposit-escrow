"use client";

import { EscrowStatus } from "@/types/escrow";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

interface EscrowTimelineProps {
  status: EscrowStatus;
  checkoutTimestamp: number;
  inspectionSeconds: number;
}

export function EscrowTimeline({
  status,
  checkoutTimestamp,
  inspectionSeconds,
}: EscrowTimelineProps) {
  const steps = [
    { key: "Created", label: "Agreement Signed", desc: "Escrow created on Soroban" },
    { key: "Funded", label: "Deposit Locked", desc: "Funds held in contract" },
    { key: "CheckoutInitiated", label: "Checkout Notice", desc: "Inspection countdown" },
    { key: "Finalized", label: "Funds Released", desc: "Tenant refunded or ruled" },
  ];

  const getStepState = (stepKey: string) => {
    if (status === "Disputed") {
      if (stepKey === "Finalized") return "disputed";
      return "done";
    }

    if (status === "Released" || status === "Resolved") {
      return "done";
    }

    if (status === "Created") {
      return stepKey === "Created" ? "current" : "upcoming";
    }

    if (status === "Funded") {
      if (stepKey === "Created") return "done";
      if (stepKey === "Funded") return "current";
      return "upcoming";
    }

    if (status === "CheckoutInitiated") {
      if (stepKey === "Created" || stepKey === "Funded") return "done";
      if (stepKey === "CheckoutInitiated") return "current";
      return "upcoming";
    }

    return "upcoming";
  };

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {steps.map((s, idx) => {
          const state = getStepState(s.key);

          return (
            <div key={s.key} className="flex flex-col items-start relative">
              <div className="flex items-center space-x-2 w-full mb-2">
                {state === "done" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {state === "current" && (
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-pulse shrink-0">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                )}
                {state === "upcoming" && (
                  <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                )}
                {state === "disputed" && (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}

                <div
                  className={clsx(
                    "h-0.5 w-full",
                    idx === steps.length - 1 ? "hidden" : "block",
                    state === "done" ? "bg-emerald-500/60" : "bg-slate-800"
                  )}
                />
              </div>

              <span
                className={clsx(
                  "text-xs font-semibold",
                  state === "current" && "text-cyan-300",
                  state === "done" && "text-slate-200",
                  state === "upcoming" && "text-slate-500",
                  state === "disputed" && "text-rose-400"
                )}
              >
                {s.label}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">{s.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
