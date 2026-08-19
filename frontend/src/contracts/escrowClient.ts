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
import { EscrowAgreement, CreateEscrowParams, EscrowStatus } from "@/types/escrow";
import { NetworkConfig } from "@/types/stellar";
import { walletKit } from "@/services/walletKit";

const STATUS_MAP: Record<number, EscrowStatus> = {
  0: "Created",
  1: "Funded",
  2: "CheckoutInitiated",
  3: "Disputed",
  4: "Released",
  5: "Resolved",
  6: "Cancelled",
};

export class EscrowContractClient {
  private contractId: string;
  private config: NetworkConfig;
  private rpcServer: rpc.Server;

  constructor(config: NetworkConfig) {
    this.config = config;
    this.contractId = config.escrowContractId;
    this.rpcServer = new rpc.Server(config.rpcUrl);
  }

  public async getEscrow(escrowId: number): Promise<EscrowAgreement | null> {
    try {
      const contract = new Contract(this.contractId);
      const call = contract.call("get_escrow", nativeToScVal(escrowId, { type: "u64" }));

      // Simulate a read-only call
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
          id: Number(val.id),
          landlord: val.landlord,
          tenant: val.tenant,
          token: val.token,
          depositAmount: (Number(val.deposit_amount) / 10_000_000).toString(),
          depositAmountRaw: val.deposit_amount.toString(),
          inspectionSeconds: Number(val.inspection_seconds),
          checkoutTimestamp: Number(val.checkout_timestamp),
          arbiterContract: val.arbiter_contract,
          status: STATUS_MAP[Number(val.status)] || "Created",
          createdAt: Number(val.created_at),
        };
      }
      return null;
    } catch (err) {
      console.warn(`Error fetching escrow #${escrowId}:`, err);
      return null;
    }
  }

  public async getEscrowCounter(): Promise<number> {
    try {
      const contract = new Contract(this.contractId);
      const call = contract.call("get_escrow_count");

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
        return Number(scValToNative(simRes.result.retval));
      }
      return 0;
    } catch {
      return 0;
    }
  }

  public async createEscrow(
    senderAddress: string,
    params: CreateEscrowParams,
    onStatus?: (status: string) => void
  ): Promise<{ escrowId: number; txHash: string }> {
    onStatus?.("Building transaction...");
    const contract = new Contract(this.contractId);

    // Convert deposit to stroops (7 decimals for Stellar assets)
    const depositRaw = BigInt(Math.floor(parseFloat(params.depositAmount) * 10_000_000));
    const inspectionSecs = BigInt(params.inspectionDays * 86400);

    const callOp = contract.call(
      "create_escrow",
      new Address(params.landlord).toScVal(),
      new Address(params.tenant).toScVal(),
      new Address(params.token).toScVal(),
      nativeToScVal(depositRaw, { type: "i128" }),
      nativeToScVal(inspectionSecs, { type: "u64" }),
      new Address(params.arbiterContract).toScVal()
    );

    return await this.signAndSubmit(senderAddress, callOp, onStatus);
  }

  public async deposit(
    senderAddress: string,
    escrowId: number,
    onStatus?: (status: string) => void
  ) {
    onStatus?.("Building deposit transaction...");
    const contract = new Contract(this.contractId);
    const callOp = contract.call(
      "deposit",
      nativeToScVal(escrowId, { type: "u64" }),
      new Address(senderAddress).toScVal()
    );
    return await this.signAndSubmit(senderAddress, callOp, onStatus);
  }

  public async initiateCheckout(
    senderAddress: string,
    escrowId: number,
    onStatus?: (status: string) => void
  ) {
    onStatus?.("Building checkout transaction...");
    const contract = new Contract(this.contractId);
    const callOp = contract.call(
      "initiate_checkout",
      nativeToScVal(escrowId, { type: "u64" }),
      new Address(senderAddress).toScVal()
    );
    return await this.signAndSubmit(senderAddress, callOp, onStatus);
  }

  public async confirmRelease(
    senderAddress: string,
    escrowId: number,
    onStatus?: (status: string) => void
  ) {
    onStatus?.("Building release confirmation...");
    const contract = new Contract(this.contractId);
    const callOp = contract.call(
      "confirm_release",
      nativeToScVal(escrowId, { type: "u64" }),
      new Address(senderAddress).toScVal()
    );
    return await this.signAndSubmit(senderAddress, callOp, onStatus);
  }

  public async claimAutoRelease(
    senderAddress: string,
    escrowId: number,
    onStatus?: (status: string) => void
  ) {
    onStatus?.("Building auto-release claim...");
    const contract = new Contract(this.contractId);
    const callOp = contract.call(
      "claim_auto_release",
      nativeToScVal(escrowId, { type: "u64" })
    );
    return await this.signAndSubmit(senderAddress, callOp, onStatus);
  }

  public async raiseDispute(
    senderAddress: string,
    escrowId: number,
    claimAmount: string,
    reason: string,
    onStatus?: (status: string) => void
  ) {
    onStatus?.("Building dispute transaction...");
    const contract = new Contract(this.contractId);
    const claimRaw = BigInt(Math.floor(parseFloat(claimAmount) * 10_000_000));
    const callOp = contract.call(
      "raise_dispute",
      nativeToScVal(escrowId, { type: "u64" }),
      new Address(senderAddress).toScVal(),
      nativeToScVal(claimRaw, { type: "i128" }),
      nativeToScVal(reason.substring(0, 30), { type: "symbol" })
    );
    return await this.signAndSubmit(senderAddress, callOp, onStatus);
  }

  private async signAndSubmit(
    senderAddress: string,
    operation: xdr.Operation,
    onStatus?: (status: string) => void
  ): Promise<{ escrowId: any; txHash: string }> {
    onStatus?.("Simulating transaction on Soroban...");

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
      throw new Error(`Transaction failed submission: ${JSON.stringify(sendRes.errorResult)}`);
    }

    onStatus?.("Waiting for ledger confirmation...");
    let getTxRes = await this.rpcServer.getTransaction(sendRes.hash);
    while (getTxRes.status === "NOT_FOUND") {
      await new Promise((r) => setTimeout(r, 1000));
      getTxRes = await this.rpcServer.getTransaction(sendRes.hash);
    }

    if (getTxRes.status === "FAILED") {
      throw new Error(`Transaction failed execution on-chain: ${sendRes.hash}`);
    }

    let returnVal: any = null;
    if (getTxRes.resultMetaXdr) {
      try {
        if (getTxRes.returnValue) {
          returnVal = scValToNative(getTxRes.returnValue);
        }
      } catch {
        // ignore
      }
    }

    onStatus?.("Confirmed on ledger!");
    return { escrowId: returnVal, txHash: sendRes.hash };
  }
}
