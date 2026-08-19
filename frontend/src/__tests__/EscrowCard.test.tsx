import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { EscrowCard } from "../components/escrow/EscrowCard";
import { EscrowAgreement } from "../types/escrow";

describe("EscrowCard Component", () => {
  const mockEscrow: EscrowAgreement = {
    id: 42,
    landlord: "GD6W5J4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF",
    tenant: "GB7X2M9P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF2Y5P4X7VNZF",
    token: "USDC",
    depositAmount: "1500.00",
    depositAmountRaw: "15000000000",
    inspectionSeconds: 86400 * 7,
    checkoutTimestamp: 0,
    arbiterContract: "CBVU37P2N6F5VNJT77FZ",
    status: "Funded",
    createdAt: 1700000000,
  };

  it("should render escrow ID and deposit amount correctly", () => {
    render(<EscrowCard escrow={mockEscrow} />);
    expect(screen.getByText("Escrow #42")).toBeInTheDocument();
    expect(screen.getByText("1500.00")).toBeInTheDocument();
    expect(screen.getByText("Deposit Locked (Active)")).toBeInTheDocument();
  });

  it("should display shortened landlord and tenant addresses", () => {
    render(<EscrowCard escrow={mockEscrow} />);
    expect(screen.getByText(/GD6W5\.\.\.VNZF/)).toBeInTheDocument();
    expect(screen.getByText(/GB7X2\.\.\.VNZF/)).toBeInTheDocument();
  });
});
