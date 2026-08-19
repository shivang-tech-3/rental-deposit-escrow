"use client";

import { useState } from "react";
import { useEventStream } from "@/hooks/useEventStream";
import { useWalletStore } from "@/state/walletStore";
import { EscrowEventData } from "@/types/escrow";
import {
  Activity,
  Radio,
  Filter,
  Sparkles,
  ExternalLink,
  Shield,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

export default function ActivityFeedPage() {
  const { events, addSimulatedEvent } = useEventStream();
  const { network } = useWalletStore();
  const [filterType, setFilterType] = useState<string>("all");

  const mockSeedEvents: EscrowEventData[] = [
    {
      id: "evt_101",
      eventType: "created",
      contractId: "CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      escrowId: 101,
      topics: ["created", "101", "GD6W5J..."],
      data: { tenant: "GB7X2M...", deposit: "1200 USDC", days: 7 },
      timestamp: Date.now() - 60000 * 5,
      txHash: "a9f8b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde",
    },
    {
      id: "evt_102",
      eventType: "funded",
      contractId: "CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      escrowId: 101,
      topics: ["funded", "101", "GB7X2M..."],
      data: "12000000000",
      timestamp: Date.now() - 60000 * 3,
      txHash: "123456789abcdef0123456789abcdea9f8b2c3d4e5f60718293a4b5c6d7e8f90",
    },
    {
      id: "evt_103",
      eventType: "checkout",
      contractId: "CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      escrowId: 98,
      topics: ["checkout", "98", "GA4Z9Y..."],
      data: Math.floor(Date.now() / 1000) + 86400 * 5,
      timestamp: Date.now() - 60000 * 2,
      txHash: "7e8f90123456789abcdef0123456789abcdea9f8b2c3d4e5f60718293a4b5c6d",
    },
    {
      id: "evt_104",
      eventType: "autorelease",
      contractId: "CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      escrowId: 95,
      topics: ["autorelease", "95", "GB9K1P..."],
      data: "20000000000",
      timestamp: Date.now() - 60000 * 1,
      txHash: "c6d7e8f90123456789abcdef0123456789abcdea9f8b2c3d4e5f60718293a4b5",
    },
  ];

  const allEvents = events.length > 0 ? events : mockSeedEvents;

  const filteredEvents = allEvents.filter((evt) => {
    if (filterType === "all") return true;
    return evt.eventType === filterType;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case "created":
        return {
          label: "Escrow Created",
          color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          icon: Sparkles,
        };
      case "funded":
        return {
          label: "Deposit Locked",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          icon: Coins,
        };
      case "checkout":
        return {
          label: "Checkout Notice",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: Clock,
        };
      case "released":
      case "autorelease":
        return {
          label: "Funds Released",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: CheckCircle2,
        };
      case "disputed":
        return {
          label: "Dispute Raised",
          color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: AlertTriangle,
        };
      case "resolved":
        return {
          label: "Dispute Ruled",
          color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
          icon: Shield,
        };
      default:
        return {
          label: type,
          color: "bg-slate-500/10 text-slate-400 border-slate-500/30",
          icon: Zap,
        };
    }
  };

  const getExplorerUrl = (hash: string) => {
    const net = network === "MAINNET" ? "public" : "testnet";
    return `https://stellar.expert/explorer/${net}/tx/${hash}`;
  };

  const simulateIncomingEvent = () => {
    const newId = Math.floor(Math.random() * 900) + 100;
    addSimulatedEvent({
      id: `sim_${Date.now()}`,
      eventType: "funded",
      contractId: "CAVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ",
      escrowId: newId,
      topics: ["funded", String(newId), "GB_SIMULATED_TENANT"],
      data: "15000000000",
      timestamp: Date.now(),
      txHash: "e4f8b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde",
    });
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2.5">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span>Real-Time On-Chain Activity Feed</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live Soroban RPC event stream listening to escrow contract & arbitration events
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={simulateIncomingEvent}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-700/50 hover:bg-cyan-900/60 text-cyan-300 text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Live Event</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel p-3 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
        <Filter className="w-4 h-4 text-slate-500 ml-2 mr-1" />
        {[
          { key: "all", label: "All Events" },
          { key: "created", label: "Created" },
          { key: "funded", label: "Funded" },
          { key: "checkout", label: "Checkouts" },
          { key: "autorelease", label: "Auto-Releases" },
          { key: "disputed", label: "Disputes" },
          { key: "resolved", label: "Rulings" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === f.key
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Event Stream List */}
      <div className="space-y-3">
        {filteredEvents.map((event) => {
          const badge = getEventBadge(event.eventType);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={event.id}
              className="glass-panel p-4 rounded-2xl hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-start md:items-center space-x-3.5">
                <div className={clsx("p-2.5 rounded-xl border shrink-0", badge.color)}>
                  <BadgeIcon className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-100">{badge.label}</span>
                    {event.escrowId > 0 && (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        Escrow #{event.escrowId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Topic: {event.topics.join(" • ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-4 text-xs">
                <span className="text-slate-500 text-[11px]">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>

                {event.txHash && (
                  <a
                    href={getExplorerUrl(event.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-cyan-400 hover:underline font-mono text-[11px]"
                  >
                    <span>{event.txHash.substring(0, 6)}...{event.txHash.substring(event.txHash.length - 6)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
