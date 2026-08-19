export type StellarNetwork = "TESTNET" | "MAINNET" | "FUTURENET" | "LOCAL";

export interface NetworkConfig {
  network: StellarNetwork;
  networkPassphrase: string;
  rpcUrl: string;
  horizonUrl: string;
  escrowContractId: string;
  arbitrationContractId: string;
  nativeAssetCode: string;
  usdcAssetContract: string;
}

export type TxLifecycleStatus =
  | "idle"
  | "building"
  | "simulating"
  | "awaiting_signature"
  | "submitting"
  | "confirmed"
  | "failed";

export interface TrackedTransaction {
  id: string;
  title: string;
  description: string;
  status: TxLifecycleStatus;
  txHash?: string;
  error?: string;
  timestamp: number;
  retryAction?: () => Promise<void>;
}
