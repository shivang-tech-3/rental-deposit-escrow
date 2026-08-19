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
    disconnect,
    setNetwork,
    refreshBalances: fetchBalances,
  };
}
