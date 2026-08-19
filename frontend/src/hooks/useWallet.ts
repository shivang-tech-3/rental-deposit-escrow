"use client";

import { useEffect, useCallback } from "react";
import { useWalletStore } from "@/state/walletStore";
import { walletKit } from "@/services/walletKit";
import { StellarRpcService } from "@/services/stellarRpc";

export function useWallet() {
  const {
    address,
    walletName,
    network,
    networkConfig,
    isConnected,
    isConnecting,
    balanceXlm,
    balanceUsdc,
    setAddress,
    setNetwork,
    setConnecting,
    setBalances,
    disconnect: storeDisconnect,
  } = useWalletStore();

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    const rpcService = new StellarRpcService(networkConfig);
    const balances = await rpcService.getAccountBalances(address);
    setBalances(balances.xlm, balances.usdc);
  }, [address, networkConfig, setBalances]);

  useEffect(() => {
    walletKit.init(network);
    if (address) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [address, network, fetchBalances]);

  const connect = async () => {
    setConnecting(true);
    await walletKit.openModal(
      (selectedAddress, selectedWallet) => {
        setAddress(selectedAddress, selectedWallet);
      },
      (err) => {
        console.error("Wallet connection error:", err);
        setConnecting(false);
      }
    );
  };

  const connectDemo = async (role: "tenant" | "landlord" | "arbiter", customAddress?: string) => {
    setConnecting(true);
    const demoAccounts: Record<string, { address: string; name: string; xlm: string; usdc: string }> = {
      tenant: {
        address: customAddress || "GB7A46T2X3O9J8QY7K1P3S9M6N2W1J8QY7K1P3S9M6N2W1J8QY7K1P3S",
        name: "Demo Tenant",
        xlm: "10000.00",
        usdc: "5000.00",
      },
      landlord: {
        address: customAddress || "GCK2V6P5VNJT77FZX2J2X2V6P5VNJT77FZX2J2X2V6P5VNJT77FZX2J2X2",
        name: "Demo Landlord",
        xlm: "15000.00",
        usdc: "12000.00",
      },
      arbiter: {
        address: customAddress || "GDW9U8QY7K1P3S9M6N2W1J8QY7K1P3S9M6N2W1J8QY7K1P3S9M6N2W1J8Q",
        name: "Demo Arbiter",
        xlm: "5000.00",
        usdc: "2500.00",
      },
    };

    const target = demoAccounts[role] || demoAccounts.tenant;
    setAddress(target.address, target.name);
    setBalances(target.xlm, target.usdc);
    setConnecting(false);
  };

  const disconnect = () => {
    storeDisconnect();
  };

  return {
    address,
    walletName,
    network,
    networkConfig,
    isConnected,
    isConnecting,
    balanceXlm,
    balanceUsdc,
    connect,
    connectDemo,
    disconnect,
    setNetwork,
    refreshBalances: fetchBalances,
  };
}

