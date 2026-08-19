"use client";

import { useWalletStore } from "@/state/walletStore";
import { useEscrowStore } from "@/state/escrowStore";
import { ArbitrationContractClient } from "@/contracts/arbitrationClient";
import { DisputeRecord } from "@/types/arbitration";
import { useTxCenter } from "./useTxCenter";
import { useCallback } from "react";

export function useArbitration() {
  const { address, networkConfig } = useWalletStore();
  const { disputes, upsertDispute, setDisputes, setLoading } = useEscrowStore();
  const { trackAction } = useTxCenter();

  const getClient = useCallback(() => {
    return new ArbitrationContractClient(networkConfig);
  }, [networkConfig]);

  const loadDispute = useCallback(
    async (disputeId: number): Promise<DisputeRecord | null> => {
      const client = getClient();
      const record = await client.getDispute(disputeId);
      if (record) {
        upsertDispute(record);
      }
      return record;
    },
    [getClient, upsertDispute]
  );

  const openDispute = async (
    escrowContract: string,
    escrowId: number,
    arbiter: string,
    claimAmount: string,
    evidenceUri: string
  ) => {
    if (!address) throw new Error("Wallet not connected");
    const client = getClient();

    return await trackAction(
      `Open Arbitration Case (Escrow #${escrowId})`,
      `Submitting claim of ${claimAmount} with evidence hash`,
      async (onStatus) => {
        return await client.openDispute(
          address,
          escrowContract,
          escrowId,
          arbiter,
          claimAmount,
          evidenceUri,
          onStatus
        );
      }
    );
  };

  const submitEvidence = async (disputeId: number, evidenceUri: string) => {
    if (!address) throw new Error("Wallet not connected");
    const client = getClient();

    return await trackAction(
      `Submit Evidence (Dispute #${disputeId})`,
      `Recording IPFS hash to dispute file`,
      async (onStatus) => {
        const res = await client.submitEvidence(address, disputeId, evidenceUri, onStatus);
        await loadDispute(disputeId);
        return res;
      }
    );
  };

  const issueRuling = async (
    disputeId: number,
    tenantPayout: string,
    landlordPayout: string
  ) => {
    if (!address) throw new Error("Wallet not connected");
    const client = getClient();

    return await trackAction(
      `Issue Ruling (Dispute #${disputeId})`,
      `Executing cross-contract payout: Tenant=${tenantPayout}, Landlord=${landlordPayout}`,
      async (onStatus) => {
        const res = await client.issueRuling(
          address,
          disputeId,
          tenantPayout,
          landlordPayout,
          onStatus
        );
        await loadDispute(disputeId);
        return res;
      }
    );
  };

  return {
    disputes: Object.values(disputes),
    disputesMap: disputes,
    loadDispute,
    openDispute,
    submitEvidence,
    issueRuling,
  };
}
