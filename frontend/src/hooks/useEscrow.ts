"use client";

import { useWalletStore } from "@/state/walletStore";
import { useEscrowStore } from "@/state/escrowStore";
import { EscrowContractClient } from "@/contracts/escrowClient";
import { CreateEscrowParams, EscrowAgreement } from "@/types/escrow";
import { useTxCenter } from "./useTxCenter";
import { useCallback } from "react";

export function useEscrow() {
  const { address, networkConfig } = useWalletStore();
  const { escrows, upsertEscrow, setEscrows, setLoading, isLoading } = useEscrowStore();
  const { trackAction } = useTxCenter();

  const getClient = useCallback(() => {
    return new EscrowContractClient(networkConfig);
  }, [networkConfig]);

  const loadEscrow = useCallback(
    async (escrowId: number): Promise<EscrowAgreement | null> => {
      const client = getClient();
      const agreement = await client.getEscrow(escrowId);
      if (agreement) {
        upsertEscrow(agreement);
      }
      return agreement;
    },
    [getClient, upsertEscrow]
  );

  const loadAllEscrows = useCallback(async () => {
    setLoading(true);
    const client = getClient();
    try {
      const count = await client.getEscrowCounter();
      const list: EscrowAgreement[] = [];
      for (let id = 1; id <= count; id++) {
        const item = await client.getEscrow(id);
        if (item) list.push(item);
      }
      setEscrows(list);
    } catch (err) {
      console.warn("Failed to load all escrows:", err);
    } finally {
      setLoading(false);
    }
  }, [getClient, setEscrows, setLoading]);

  const createEscrow = async (params: CreateEscrowParams) => {
    if (!address) throw new Error("Wallet not connected");
    const client = getClient();

    return await trackAction(
      "Create Rental Escrow",
      `Creating lease deposit of ${params.depositAmount} tokens`,
      async (onStatus) => {
        const res = await client.createEscrow(address, params, onStatus);
        if (res.escrowId) {
          await loadEscrow(res.escrowId);
        }
        return res;
      }
    );
  };

  const depositFunds = async (escrowId: number, amount: string) => {
    if (!address) throw new Error("Wallet not connected");
    const client = getClient();

    return await trackAction(
      `Deposit Funds (Escrow #${escrowId})`,
      `Locking ${amount} deposit in smart contract escrow`,
      async (onStatus) => {
        const res = await client.deposit(address, escrowId, onStatus);
        await loadEscrow(escrowId);
        return res;
      }
    );
  };

  const initiateCheckout = async (escrowId: number) => {
    if (!address) throw new Error("Wallet not connected");
    const client = getClient();

    return await trackAction(
      `Initiate Checkout (Escrow #${escrowId})`,
      `Starting the inspection countdown window`,
      async (onStatus) => {
        const res = await client.initiateCheckout(address, escrowId, onStatus);
        await loadEscrow(escrowId);
        return res;
      }
    );
  };

  const confirmRelease = async (escrowId: number) => {
    if (!address) throw new Error("Wallet not connected");
    const client = getClient();

    return await trackAction(
      `Release Deposit (Escrow #${escrowId})`,
      `Landlord approving 100% refund payout to tenant`,
      async (onStatus) => {
        const res = await client.confirmRelease(address, escrowId, onStatus);
        await loadEscrow(escrowId);
        return res;
      }
    );
  };

  const claimAutoRelease = async (escrowId: number) => {
    if (!address) throw new Error("Wallet not connected");
    const client = getClient();

    return await trackAction(
      `Claim Auto-Release (Escrow #${escrowId})`,
      `Triggering timelocked payout after dispute-free inspection`,
      async (onStatus) => {
        const res = await client.claimAutoRelease(address, escrowId, onStatus);
        await loadEscrow(escrowId);
        return res;
      }
    );
  };

  const raiseDispute = async (escrowId: number, claimAmount: string, reason: string) => {
    if (!address) throw new Error("Wallet not connected");
    const client = getClient();

    return await trackAction(
      `Raise Escrow Dispute (Escrow #${escrowId})`,
      `Claiming ${claimAmount} for: ${reason}`,
      async (onStatus) => {
        const res = await client.raiseDispute(address, escrowId, claimAmount, reason, onStatus);
        await loadEscrow(escrowId);
        return res;
      }
    );
  };

  return {
    escrows: Object.values(escrows),
    escrowsMap: escrows,
    isLoading,
    loadEscrow,
    loadAllEscrows,
    createEscrow,
    depositFunds,
    initiateCheckout,
    confirmRelease,
    claimAutoRelease,
    raiseDispute,
  };
}
