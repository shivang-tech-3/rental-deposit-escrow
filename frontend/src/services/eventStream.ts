import { StellarRpcService } from "./stellarRpc";
import { NetworkConfig } from "@/types/stellar";
import { EscrowEventData } from "@/types/escrow";
import { scValToNative } from "@stellar/stellar-sdk";

export class EventStreamService {
  private rpc: StellarRpcService;
  private timer: NodeJS.Timeout | null = null;
  private lastLedger: number = 0;
  private listeners: ((event: EscrowEventData) => void)[] = [];
  private contractIds: string[] = [];

  constructor(config: NetworkConfig) {
    this.rpc = new StellarRpcService(config);
    this.contractIds = [config.escrowContractId, config.arbitrationContractId].filter(Boolean);
  }

  public subscribe(callback: (event: EscrowEventData) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public async start(intervalMs = 4000) {
    if (this.timer) return;

    try {
      this.lastLedger = await this.rpc.getLatestLedger();
    } catch {
      this.lastLedger = 1;
    }

    this.timer = setInterval(async () => {
      await this.pollOnce();
    }, intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async pollOnce() {
    if (this.contractIds.length === 0) return;

    try {
      const rawEvents = await this.rpc.pollEvents(this.lastLedger, this.contractIds);
      if (!rawEvents || rawEvents.length === 0) return;

      for (const item of rawEvents) {
        if (item.ledger > this.lastLedger) {
          this.lastLedger = item.ledger;
        }

        const topics = item.topic.map((t) => {
          try {
            return String(scValToNative(t));
          } catch {
            return "topic";
          }
        });

        let dataValue: any = null;
        try {
          dataValue = scValToNative(item.value);
        } catch {
          dataValue = item.value;
        }

        const topicName = topics[0] || "event";
        const escrowId = typeof topics[1] === "number" ? topics[1] : 0;

        const eventData: EscrowEventData = {
          id: item.id || `evt_${Date.now()}_${Math.random()}`,
          eventType: topicName as any,
          contractId: item.contractId,
          escrowId,
          topics,
          data: dataValue,
          timestamp: Date.now(),
          txHash: item.txHash || "",
        };

        this.listeners.forEach((listener) => listener(eventData));
      }
    } catch (err) {
      console.warn("Event polling cycle skipped:", err);
    }
  }
}
