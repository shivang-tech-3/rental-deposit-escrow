"use client";

import { useTxStore } from "@/state/txStore";
import { TrackedTransaction } from "@/types/stellar";

export function useTxCenter() {
  const {
    transactions,
    activeTxId,
    addTransaction,
    updateTransaction,
    clearCompleted,
    removeTransaction,
  } = useTxStore();

  const trackAction = async <T>(
    title: string,
    description: string,
    action: (onStatus: (status: string) => void) => Promise<T>
  ): Promise<T> => {
    const txId = addTransaction({
      title,
      description,
      status: "building",
    });

    try {
      updateTransaction(txId, { status: "simulating" });

      const result = await action((statusMsg: string) => {
        let status: any = "building";
        if (statusMsg.includes("Simulating")) status = "simulating";
        else if (statusMsg.includes("signature")) status = "awaiting_signature";
        else if (statusMsg.includes("Submitting")) status = "submitting";
        else if (statusMsg.includes("Confirmed")) status = "confirmed";

        updateTransaction(txId, {
          description: statusMsg,
          status,
        });
      });

      const txHash = (result as any)?.txHash;
      updateTransaction(txId, {
        status: "confirmed",
        description: "Transaction confirmed on Stellar ledger!",
        txHash,
      });

      return result;
    } catch (err: any) {
      console.error(`Transaction failed: ${title}`, err);
      updateTransaction(txId, {
        status: "failed",
        error: err.message || "Unknown error occurred",
        description: "Failed to execute transaction",
      });
      throw err;
    }
  };

  return {
    transactions,
    activeTxId,
    trackAction,
    clearCompleted,
    removeTransaction,
  };
}
