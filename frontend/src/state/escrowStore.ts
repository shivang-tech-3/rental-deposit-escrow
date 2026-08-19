import { create } from "zustand";
import { EscrowAgreement } from "@/types/escrow";
import { DisputeRecord } from "@/types/arbitration";

interface EscrowState {
  escrows: Record<number, EscrowAgreement>;
  disputes: Record<number, DisputeRecord>;
  isLoading: boolean;
  selectedEscrowId: number | null;
  setEscrows: (escrows: EscrowAgreement[]) => void;
  upsertEscrow: (escrow: EscrowAgreement) => void;
  setDisputes: (disputes: DisputeRecord[]) => void;
  upsertDispute: (dispute: DisputeRecord) => void;
  setSelectedEscrowId: (id: number | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useEscrowStore = create<EscrowState>((set) => ({
  escrows: {},
  disputes: {},
  isLoading: false,
  selectedEscrowId: null,

  setEscrows: (escrowList) => {
    const map: Record<number, EscrowAgreement> = {};
    escrowList.forEach((e) => {
      map[e.id] = e;
    });
    set({ escrows: map });
  },

  upsertEscrow: (escrow) => {
    set((state) => ({
      escrows: {
        ...state.escrows,
        [escrow.id]: escrow,
      },
    }));
  },

  setDisputes: (disputeList) => {
    const map: Record<number, DisputeRecord> = {};
    disputeList.forEach((d) => {
      map[d.disputeId] = d;
    });
    set({ disputes: map });
  },

  upsertDispute: (dispute) => {
    set((state) => ({
      disputes: {
        ...state.disputes,
        [dispute.disputeId]: dispute,
      },
    }));
  },

  setSelectedEscrowId: (selectedEscrowId) => set({ selectedEscrowId }),

  setLoading: (isLoading) => set({ isLoading }),
}));
