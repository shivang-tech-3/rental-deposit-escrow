import { describe, it, expect, beforeEach } from "vitest";
import { useWalletStore } from "../state/walletStore";

describe("WalletStore Zustand State", () => {
  beforeEach(() => {
    useWalletStore.getState().disconnect();
  });

  it("should initialize in disconnected state with default TESTNET network", () => {
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
    expect(state.network).toBe("TESTNET");
  });

  it("should update address and connection status on setAddress", () => {
    const mockAddr = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    useWalletStore.getState().setAddress(mockAddr, "Freighter");

    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(true);
    expect(state.address).toBe(mockAddr);
    expect(state.walletName).toBe("Freighter");
  });

  it("should switch networks and update networkConfig properly", () => {
    useWalletStore.getState().setNetwork("MAINNET");
    const state = useWalletStore.getState();
    expect(state.network).toBe("MAINNET");
    expect(state.networkConfig.networkPassphrase).toContain("Public Global Stellar Network");
  });
});
