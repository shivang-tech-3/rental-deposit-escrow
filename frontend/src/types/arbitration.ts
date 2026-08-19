export type DisputeStatus =
  | "Open"
  | "EvidenceCollection"
  | "Ruled"
  | "Cancelled";

export interface DisputeRecord {
  disputeId: number;
  escrowContract: string;
  escrowId: number;
  assignedArbiter: string;
  claimant: string;
  initialClaimAmount: string;
  evidenceHashes: string[];
  status: DisputeStatus;
  createdAt: number;
  resolvedAt: number;
  tenantPayout: string;
  landlordPayout: string;
}

export interface ArbiterInfo {
  address: string;
  name: string;
  rating: number;
  feeBps: number;
  resolvedCount: number;
  active: boolean;
}

export interface ArbitrationEventData {
  id: string;
  eventType: "arbr_reg" | "dsp_open" | "evid_sub" | "ruling";
  disputeId: number;
  party?: string;
  arbiter?: string;
  data: any;
  timestamp: number;
  txHash: string;
}
