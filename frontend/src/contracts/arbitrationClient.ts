import {
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
  TransactionBuilder,
  BASE_FEE,
  Account,
  rpc,
} from "@stellar/stellar-sdk";
import { DisputeRecord, DisputeStatus } from "@/types/arbitration";
import { NetworkConfig } from "@/types/stellar";
import { walletKit } from "@/services/walletKit";

const STATUS_MAP: Record<number, DisputeStatus> = {
  0: "Open",
  1: "EvidenceCollection",
  2: "Ruled",
  3: "Cancelled",
};

export class ArbitrationContractClient {
  private contractId: string;
  private config: NetworkConfig;
  private rpcServer: rpc.Server;

  constructor(config: NetworkConfig) {
    this.config = config;
    this.contractId = config.arbitrationContractId;
    this.rpcServer = new rpc.Server(config.rpcUrl);
  }

  public async getDispute(disputeId: number): Promise<DisputeRecord | null> {
    try {
      const contract = new Contract(this.contractId);
      const call = contract.call("get_dispute", nativeToScVal(disputeId, { type: "u64" }));

      const sourceAccount = new Account(
        "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
        "1"
      );
      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.config.networkPassphrase,
      })
        .addOperation(call)
        .setTimeout(30)
        .build();

      const simRes = await this.rpcServer.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(simRes) && simRes.result) {
        const val: any = scValToNative(simRes.result.retval);
        return {
          disputeId: Number(val.dispute_id),
          escrowContract: val.escrow_contract,
          escrowId: Number(val.escrow_id),
          assignedArbiter: val.assigned_arbiter,
          claimant: val.claimant,
          initialClaimAmount: (Number(val.initial_claim_amount) / 10_000_000).toString(),
          evidenceHashes: val.evidence_hashes || [],
          status: STATUS_MAP[Number(val.status)] || "Open",
          createdAt: Number(val.created_at),
          resolvedAt: Number(val.resolved_at),
          tenantPayout: (Number(val.tenant_payout) / 10_000_000).toString(),
          landlordPayout: (Number(val.landlord_payout) / 10_000_000).toString(),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  public async openDispute(
    senderAddress: string,
    escrowContract: string,
    escrowId: number,
    arbiter: string,
    claimAmount: string,
    evidenceUri: string,
    onStatus?: (status: string) => void
  ) {
    onStatus?.("Opening arbitration dispute...");
    const contract = new Contract(this.contractId);
    const claimRaw = BigInt(Math.floor(parseFloat(claimAmount) * 10_000_000));

    const callOp = contract.call(
      "open_dispute",
      new Address(escrowContract).toScVal(),
      nativeToScVal(escrowId, { type: "u64" }),
      new Address(senderAddress).toScVal(),
      new Address(arbiter).toScVal(),
      nativeToScVal(claimRaw, { type: "i128" }),
      nativeToScVal(evidenceUri, { type: "string" })
    );

    return await this.signAndSubmit(senderAddress, callOp, onStatus);
  }

  public async submitEvidence(
    senderAddress: string,
    disputeId: number,
    evidenceUri: string,
    onStatus?: (status: string) => void
  ) {
    onStatus?.("Submitting evidence hash to chain...");
    const contract = new Contract(this.contractId);
    const callOp = contract.call(
      "submit_evidence",
      nativeToScVal(disputeId, { type: "u64" }),
      new Address(senderAddress).toScVal(),
      nativeToScVal(evidenceUri, { type: "string" })
    );

    return await this.signAndSubmit(senderAddress, callOp, onStatus);
  }

  public async issueRuling(
    senderAddress: string,
    disputeId: number,
    tenantPayout: string,
    landlordPayout: string,
    onStatus?: (status: string) => void
  ) {
    onStatus?.("Issuing binding ruling & cross-contract release...");
    const contract = new Contract(this.contractId);
    const tenantRaw = BigInt(Math.floor(parseFloat(tenantPayout) * 10_000_000));
    const landlordRaw = BigInt(Math.floor(parseFloat(landlordPayout) * 10_000_000));

    const callOp = contract.call(
      "issue_ruling",
      nativeToScVal(disputeId, { type: "u64" }),
      new Address(senderAddress).toScVal(),
      nativeToScVal(tenantRaw, { type: "i128" }),
      nativeToScVal(landlordRaw, { type: "i128" })
    );

    return await this.signAndSubmit(senderAddress, callOp, onStatus);
  }

  private async signAndSubmit(
    senderAddress: string,
    operation: xdr.Operation,
    onStatus?: (status: string) => void
  ): Promise<{ disputeId?: any; txHash: string }> {
    onStatus?.("Simulating transaction...");
    const account = await this.rpcServer.getAccount(senderAddress);
    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: this.config.networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(60)
      .build();

    const preparedTx = await this.rpcServer.prepareTransaction(tx);
    onStatus?.("Awaiting wallet signature...");
    const signedXdr = await walletKit.signTransaction(preparedTx.toXDR());

    onStatus?.("Submitting to Stellar network...");
    const sendRes = await this.rpcServer.sendTransaction(
      TransactionBuilder.fromXDR(signedXdr, this.config.networkPassphrase)
    );

    if (sendRes.status === "ERROR") {
      throw new Error(`Transaction failed: ${JSON.stringify(sendRes.errorResult)}`);
    }

    onStatus?.("Waiting for ledger confirmation...");
    let getTxRes = await this.rpcServer.getTransaction(sendRes.hash);
    while (getTxRes.status === "NOT_FOUND") {
      await new Promise((r) => setTimeout(r, 1000));
      getTxRes = await this.rpcServer.getTransaction(sendRes.hash);
    }

    if (getTxRes.status === "FAILED") {
      throw new Error(`Transaction failed execution: ${sendRes.hash}`);
    }

    return { txHash: sendRes.hash };
  }
}
