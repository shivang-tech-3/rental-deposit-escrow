export type EscrowStatus =
  | "Created"
  | "Funded"
  | "CheckoutInitiated"
  | "Disputed"
  | "Released"
  | "Resolved"
  | "Cancelled";

export interface EscrowAgreement {
  id: number;
  landlord: string;
  tenant: string;
  token: string;
  depositAmount: string; // Formatted display amount
  depositAmountRaw: string; // Stroop/raw i128
  inspectionSeconds: number;
  checkoutTimestamp: number;
  arbiterContract: string;
  status: EscrowStatus;
  createdAt: number;
}

export interface CreateEscrowParams {
  landlord: string;
  tenant: string;
  token: string;
  depositAmount: string;
  inspectionDays: number;
  arbiterContract: string;
}

export interface EscrowEventData {
  id: string;
  eventType: "created" | "funded" | "checkout" | "released" | "autorelease" | "disputed" | "resolved";
  contractId: string;
  escrowId: number;
  topics: string[];
  data: any;
  timestamp: number;
  txHash: string;
}
