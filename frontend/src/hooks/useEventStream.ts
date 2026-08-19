"use client";

import { useEffect, useState } from "react";
import { useWalletStore } from "@/state/walletStore";
import { EventStreamService } from "@/services/eventStream";
import { EscrowEventData } from "@/types/escrow";

export function useEventStream() {
  const { networkConfig } = useWalletStore();
  const [events, setEvents] = useState<EscrowEventData[]>([]);
  const [latestEvent, setLatestEvent] = useState<EscrowEventData | null>(null);

  useEffect(() => {
    const service = new EventStreamService(networkConfig);

    const unsubscribe = service.subscribe((event) => {
      setEvents((prev) => [event, ...prev.slice(0, 99)]);
      setLatestEvent(event);
    });

    service.start(4000);

    return () => {
      unsubscribe();
      service.stop();
    };
  }, [networkConfig]);

  const addSimulatedEvent = (event: EscrowEventData) => {
    setEvents((prev) => [event, ...prev.slice(0, 99)]);
    setLatestEvent(event);
  };

  return {
    events,
    latestEvent,
    addSimulatedEvent,
  };
}
