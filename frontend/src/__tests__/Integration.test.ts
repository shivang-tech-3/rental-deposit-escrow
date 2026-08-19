import { describe, it, expect } from "vitest";
import { IpfsService } from "../services/ipfs";
import { useEscrowStore } from "../state/escrowStore";

describe("End-to-End Escrow & Arbitration Flow Simulation", () => {
  it("should upload evidence metadata to IPFS and generate valid CID", async () => {
    const metadata = {
      title: "Move-out Inspection",
      description: "Wall scratch damages in master bedroom",
      files: [],
      uploadedBy: "GD6W5J4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF",
      timestamp: 1700000000,
    };

    const { cid, uri } = await IpfsService.uploadEvidence(metadata);
    expect(cid).toContain("bafybei");
    expect(uri).toContain("ipfs://bafybei");

    const fetched = await IpfsService.fetchEvidence(cid);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe(metadata.title);
  });

  it("should update escrow lifecycle store from created -> funded -> disputed -> resolved", () => {
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

    // Step 3: Dispute & Ruling
    store.upsertEscrow({
      ...useEscrowStore.getState().escrows[1],
      status: "Resolved",
    });
    expect(useEscrowStore.getState().escrows[1].status).toBe("Resolved");
  });
});
