import { rpc, scValToNative, nativeToScVal, Address, Horizon } from "@stellar/stellar-sdk";
import { NetworkConfig } from "@/types/stellar";

export class StellarRpcService {
  private rpcServer: rpc.Server;
  private horizonServer: Horizon.Server;
  private config: NetworkConfig;

  constructor(config: NetworkConfig) {
    this.config = config;
    this.rpcServer = new rpc.Server(config.rpcUrl);
    this.horizonServer = new Horizon.Server(config.horizonUrl);
  }

  public async getAccountBalances(address: string): Promise<{ xlm: string; usdc: string }> {
    try {
      const account = await this.horizonServer.loadAccount(address);
      let xlm = "0";
      let usdc = "0";

      account.balances.forEach((b) => {
        if (b.asset_type === "native") {
          xlm = parseFloat(b.balance).toFixed(2);
        } else if ("asset_code" in b && b.asset_code === "USDC") {
          usdc = parseFloat(b.balance).toFixed(2);
        }
      });

      return { xlm, usdc };
    } catch (err) {
      console.warn("Could not fetch account balances:", err);
      return { xlm: "0", usdc: "0" };
    }
  }

  public async getLatestLedger(): Promise<number> {
    const latest = await this.rpcServer.getLatestLedger();
    return latest.sequence;
  }

  public async simulateTransaction(tx: any): Promise<rpc.Api.SimulateTransactionResponse> {
    return await this.rpcServer.simulateTransaction(tx);
  }

  public async sendTransaction(tx: any): Promise<rpc.Api.SendTransactionResponse> {
    return await this.rpcServer.sendTransaction(tx);
  }

  public async getTransaction(hash: string): Promise<rpc.Api.GetTransactionResponse> {
    return await this.rpcServer.getTransaction(hash);
  }

  public async pollEvents(startLedger: number, contractIds: string[]) {
    try {
      const response = await this.rpcServer.getEvents({
        startLedger,
        filters: [
          {
            type: "contract",
            contractIds,
          },
        ],
        limit: 50,
      });
      return response.events;
    } catch (err) {
      console.warn("Error polling Soroban events:", err);
      return [];
    }
  }
}
