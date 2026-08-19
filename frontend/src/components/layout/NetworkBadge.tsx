"use client";

import { useWallet } from "@/hooks/useWallet";
import { StellarNetwork } from "@/types/stellar";
import { Globe } from "lucide-react";

export function NetworkBadge() {
  const { network, setNetwork } = useWallet();

  return (
    <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-700/60 rounded-full px-3 py-1 text-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Globe className="w-3.5 h-3.5 text-slate-400" />
      <select
        value={network}
        onChange={(e) => setNetwork(e.target.value as StellarNetwork)}
        className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
      >
        <option value="TESTNET" className="bg-slate-900 text-slate-200">
          Stellar Testnet
        </option>
        <option value="MAINNET" className="bg-slate-900 text-slate-200">
          Stellar Mainnet
        </option>
        <option value="FUTURENET" className="bg-slate-900 text-slate-200">
          Futurenet
        </option>
        <option value="LOCAL" className="bg-slate-900 text-slate-200">
          Local Standalone
        </option>
      </select>
    </div>
  );
}
