"use client";

import { useTxStore } from "@/state/txStore";
import { useWalletStore } from "@/state/walletStore";
import { CheckCircle2, XCircle, Loader2, ExternalLink, X } from "lucide-react";
import { clsx } from "clsx";

export function TransactionToast() {
  const { transactions, removeTransaction } = useTxStore();
  const { network } = useWalletStore();

  const activeTxs = transactions.slice(0, 3);
  if (activeTxs.length === 0) return null;

  const getExplorerUrl = (hash: string) => {
    const net = network === "MAINNET" ? "public" : "testnet";
    return `https://stellar.expert/explorer/${net}/tx/${hash}`;
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full">
      {activeTxs.map((tx) => {
        const isPending =
          tx.status === "building" ||
          tx.status === "simulating" ||
          tx.status === "awaiting_signature" ||
          tx.status === "submitting";

        return (
          <div
            key={tx.id}
            className={clsx(
              "p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 transform",
              isPending && "bg-slate-900/90 border-cyan-500/40 text-slate-100 shadow-cyan-900/20",
              tx.status === "confirmed" && "bg-emerald-950/80 border-emerald-500/50 text-emerald-100",
              tx.status === "failed" && "bg-rose-950/80 border-rose-500/50 text-rose-100"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                {isPending && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                {tx.status === "confirmed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {tx.status === "failed" && <XCircle className="w-4 h-4 text-rose-400" />}

                <div>
                  <h4 className="text-xs font-semibold leading-none">{tx.title}</h4>
                  <p className="text-[11px] opacity-80 mt-1">{tx.description}</p>
                </div>
              </div>

              <button
                onClick={() => removeTransaction(tx.id)}
                className="text-slate-400 hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {tx.txHash && (
              <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px]">
                <span className="font-mono opacity-60">
                  {tx.txHash.substring(0, 8)}...{tx.txHash.substring(tx.txHash.length - 8)}
                </span>
                <a
                  href={getExplorerUrl(tx.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-cyan-400 hover:underline font-medium"
                >
                  <span>StellarExpert</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}

            {tx.error && (
              <div className="mt-2 p-1.5 rounded bg-rose-900/30 text-rose-300 text-[10px] font-mono break-all">
                {tx.error}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
