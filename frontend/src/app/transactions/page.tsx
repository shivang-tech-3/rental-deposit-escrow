"use client";

import { useTxStore } from "@/state/txStore";
import { useWalletStore } from "@/state/walletStore";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Trash2,
  Clock,
} from "lucide-react";
import { clsx } from "clsx";

export default function TransactionCenterPage() {
  const { transactions, clearCompleted, removeTransaction } = useTxStore();
  const { network } = useWalletStore();

  const getExplorerUrl = (hash: string) => {
    const net = network === "MAINNET" ? "public" : "testnet";
    return `https://stellar.expert/explorer/${net}/tx/${hash}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span>Transaction Lifecycle Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of simulations, wallet signatures, mempool submissions, and ledger confirmations
          </p>
        </div>

        {transactions.length > 0 && (
          <button
            onClick={clearCompleted}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed</span>
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Transactions Tracked</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Transactions initiated from Escrow Creation, Deposits, Checkouts, or Arbitration rulings will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => {
            const isPending =
              tx.status === "building" ||
              tx.status === "simulating" ||
              tx.status === "awaiting_signature" ||
              tx.status === "submitting";

            return (
              <div
                key={tx.id}
                className={clsx(
                  "glass-panel p-5 rounded-2xl border transition-all space-y-3",
                  isPending && "border-cyan-500/40 bg-slate-900/80",
                  tx.status === "confirmed" && "border-emerald-500/30 bg-emerald-950/20",
                  tx.status === "failed" && "border-rose-500/30 bg-rose-950/20"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {isPending && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                      {tx.status === "confirmed" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                      {tx.status === "failed" && <XCircle className="w-5 h-5 text-rose-400" />}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{tx.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{tx.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={clsx(
                        "text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider",
                        isPending && "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
                        tx.status === "confirmed" &&
                          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                        tx.status === "failed" &&
                          "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      )}
                    >
                      {tx.status}
                    </span>

                    <button
                      onClick={() => removeTransaction(tx.id)}
                      className="text-slate-500 hover:text-slate-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs border-t border-slate-800/80 pt-3 text-slate-400">
                  <span>Tracked at: {new Date(tx.timestamp).toLocaleString()}</span>

                  {tx.txHash && (
                    <a
                      href={getExplorerUrl(tx.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-cyan-400 hover:underline font-mono"
                    >
                      <span>Tx: {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 8)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {tx.error && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono break-all">
                    {tx.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
