import { create } from "zustand";
import { TrackedTransaction, TxLifecycleStatus } from "@/types/stellar";

interface TxState {
  transactions: TrackedTransaction[];
  activeTxId: string | null;
  addTransaction: (tx: Omit<TrackedTransaction, "id" | "timestamp">) => string;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<TrackedTransaction, "id" | "timestamp">>
  ) => void;
  clearCompleted: () => void;
  removeTransaction: (id: string) => void;
}

export const useTxStore = create<TxState>((set) => ({
  transactions: [],
  activeTxId: null,

  addTransaction: (tx) => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTx: TrackedTransaction = {
      ...tx,
      id,
      timestamp: Date.now(),
    };
    set((state) => ({
      transactions: [newTx, ...state.transactions],
      activeTxId: id,
    }));
    return id;
  },

  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
      activeTxId:
        updates.status === "confirmed" || updates.status === "failed"
          ? null
          : state.activeTxId,
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      transactions: state.transactions.filter(
        (tx) => tx.status !== "confirmed" && tx.status !== "failed"
      ),
    }));
  },

  removeTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id),
      activeTxId: state.activeTxId === id ? null : state.activeTxId,
    }));
  },
}));
