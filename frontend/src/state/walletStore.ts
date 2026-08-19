import { create } from "zustand";
import { StellarNetwork, NetworkConfig } from "@/types/stellar";

export const NETWORK_CONFIGS: Record<StellarNetwork, NetworkConfig> = {
  TESTNET: {
    network: "TESTNET",
    networkPassphrase: "Test SDF Network ; September 2015",
    rpcUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
    escrowContractId: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || "CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZX2J2X2V6P5VNJT77FZ",
    arbitrationContractId: process.env.NEXT_PUBLIC_ARBITRATION_CONTRACT_ID || "CBVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZX2J2X2V6P5VNJT77FZ",
    nativeAssetCode: "XLM",
    usdcAssetContract: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWUIE3USSTHZX5I6INT",
  },
  MAINNET: {
    network: "MAINNET",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
    rpcUrl: "https://mainnet.sorobanrpc.com",
    horizonUrl: "https://horizon.stellar.org",
    escrowContractId: "",
    arbitrationContractId: "",
    nativeAssetCode: "XLM",
    usdcAssetContract: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
  },
  FUTURENET: {
    network: "FUTURENET",
    networkPassphrase: "Test SDF Future Network ; October 2022",
    rpcUrl: "https://rpc-futurenet.stellar.org",
    horizonUrl: "https://horizon-futurenet.stellar.org",
    escrowContractId: "",
    arbitrationContractId: "",
    nativeAssetCode: "XLM",
    usdcAssetContract: "",
  },
  LOCAL: {
    network: "LOCAL",
    networkPassphrase: "Standalone Network ; February 2017",
    rpcUrl: "http://localhost:8000/soroban/rpc",
    horizonUrl: "http://localhost:8000",
    escrowContractId: "",
    arbitrationContractId: "",
    nativeAssetCode: "XLM",
    usdcAssetContract: "",
  },
};

interface WalletState {
  address: string | null;
  walletName: string | null;
  network: StellarNetwork;
  networkConfig: NetworkConfig;
  isConnected: boolean;
  isConnecting: boolean;
  balanceXlm: string;
  balanceUsdc: string;
  setAddress: (address: string | null, walletName?: string) => void;
  setNetwork: (network: StellarNetwork) => void;
  setConnecting: (isConnecting: boolean) => void;
  setBalances: (xlm: string, usdc: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  walletName: null,
  network: "TESTNET",
  networkConfig: NETWORK_CONFIGS.TESTNET,
  isConnected: false,
  isConnecting: false,
  balanceXlm: "0",
  balanceUsdc: "0",

  setAddress: (address, walletName) => {
    set({
      address,
      walletName: walletName || get().walletName,
      isConnected: !!address,
      isConnecting: false,
    });
  },

  setNetwork: (network) => {
    set({
      network,
      networkConfig: NETWORK_CONFIGS[network],
    });
  },

  setConnecting: (isConnecting) => set({ isConnecting }),

  setBalances: (balanceXlm, balanceUsdc) => set({ balanceXlm, balanceUsdc }),

  disconnect: () => {
    set({
      address: null,
      walletName: null,
      isConnected: false,
      isConnecting: false,
      balanceXlm: "0",
      balanceUsdc: "0",
    });
  },
}));
