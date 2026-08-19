"use client";

import { useWallet } from "@/hooks/useWallet";
import { Wallet, Loader2, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

export function ConnectButton() {
  const { address, isConnected, isConnecting, connect, disconnect, balanceXlm, walletName } =
    useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  const shorten = (addr: string) => `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;

  if (isConnecting) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-200 text-sm font-medium"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Connecting...</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-sm font-medium transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-400 mr-1">{walletName || "Wallet"}:</span>
          <span className="font-mono text-cyan-300">{shorten(address)}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-56 p-2 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl z-50">
            <div className="px-3 py-2 border-b border-slate-800 text-xs">
              <div className="text-slate-400">Balance</div>
              <div className="font-semibold text-slate-100 text-sm mt-0.5">
                {balanceXlm} <span className="text-cyan-400">XLM</span>
              </div>
            </div>

            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full mt-1.5 flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </button>
  );
}
