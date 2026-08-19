import { describe, it, expect } from "vitest";
import { useEscrowStore } from "../state/escrowStore";

describe("EscrowStore Zustand State", () => {
  it("should update escrow lifecycle store from created -> funded -> resolved", () => {
    const store = useEscrowStore.getState();

    // Step 1: Created
    store.upsertEscrow({
      id: 1,
      landlord: "GD6W",
      tenant: "GB7X",
      token: "USDC",
      depositAmount: "1200",
      depositAmountRaw: "12000000000",
      inspectionSeconds: 604800,
      checkoutTimestamp: 0,
      arbiterContract: "CBVU",
      status: "Created",
      createdAt: 1700000000,
    });

    expect(useEscrowStore.getState().escrows[1].status).toBe("Created");

    // Step 2: Funded
    store.upsertEscrow({
      ...useEscrowStore.getState().escrows[1],
      status: "Funded",
    });
    expect(useEscrowStore.getState().escrows[1].status).toBe("Funded");

    // Step 3: Resolved
    store.upsertEscrow({
      ...useEscrowStore.getState().escrows[1],
      status: "Resolved",
    });
    expect(useEscrowStore.getState().escrows[1].status).toBe("Resolved");
  });
});
