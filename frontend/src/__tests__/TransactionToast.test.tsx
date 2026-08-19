import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { TransactionToast } from "../components/transactions/TransactionToast";
import { useTxStore } from "../state/txStore";

describe("TransactionToast Component", () => {
  beforeEach(() => {
    useTxStore.setState({ transactions: [] });
  });

  it("should render nothing when transaction queue is empty", () => {
    const { container } = render(<TransactionToast />);
    expect(container.firstChild).toBeNull();
  });

  it("should render active pending transaction toast", () => {
    useTxStore.getState().addTransaction({
      title: "Deploying Escrow Agreement",
      description: "Submitting to Stellar testnet...",
      status: "submitting",
    });

    render(<TransactionToast />);
    expect(screen.getByText("Deploying Escrow Agreement")).toBeInTheDocument();
    expect(screen.getByText("Submitting to Stellar testnet...")).toBeInTheDocument();
  });
});
