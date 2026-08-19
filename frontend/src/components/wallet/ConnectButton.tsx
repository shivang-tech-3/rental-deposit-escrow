"use client";

import { useWallet } from "@/hooks/useWallet";
import { Wallet, Loader2, LogOut, ChevronDown, Sparkles, Building2, User, Scale } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function ConnectButton() {
  const { address, isConnected, isConnecting, connect, connectDemo, disconnect, balanceXlm, balanceUsdc, walletName } =
    useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowConnectModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-sm font-medium transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400 mr-1">{walletName || "Wallet"}:</span>
          <span className="font-mono text-cyan-300">{shorten(address)}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-2">
              <div className="text-xs text-slate-400 font-medium">Balances (Stellar Testnet)</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-bold text-slate-100">{balanceXlm}</span>
                <span className="text-xs font-semibold text-cyan-400">XLM</span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-sm font-bold text-slate-100">{balanceUsdc}</span>
                <span className="text-xs font-semibold text-emerald-400">USDC</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 px-1 mb-1.5 font-medium">Switch Sandbox Role:</div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              <button
                onClick={() => {
                  connectDemo("tenant");
                  setShowDropdown(false);
                }}
                className="flex flex-col items-center p-1.5 rounded-lg bg-slate-800/40 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 text-[10px] transition border border-slate-700/40"
              >
                <User className="w-3.5 h-3.5 mb-0.5 text-cyan-400" />
                <span>Tenant</span>
              </button>
              <button
                onClick={() => {
                  connectDemo("landlord");
                  setShowDropdown(false);
                }}
                className="flex flex-col items-center p-1.5 rounded-lg bg-slate-800/40 hover:bg-purple-500/20 text-slate-300 hover:text-purple-200 text-[10px] transition border border-slate-700/40"
              >
                <Building2 className="w-3.5 h-3.5 mb-0.5 text-purple-400" />
                <span>Landlord</span>
              </button>
              <button
                onClick={() => {
                  connectDemo("arbiter");
                  setShowDropdown(false);
                }}
                className="flex flex-col items-center p-1.5 rounded-lg bg-slate-800/40 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 text-[10px] transition border border-slate-700/40"
              >
                <Scale className="w-3.5 h-3.5 mb-0.5 text-amber-400" />
                <span>Arbiter</span>
              </button>
            </div>

            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowConnectModal(!showConnectModal)}
        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-80" />
      </button>

      {showConnectModal && (
        <div className="absolute right-0 mt-2 w-72 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-xs font-semibold text-slate-200 px-1 mb-2 flex items-center space-x-1.5">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Choose Connection Method</span>
          </div>

          <button
            onClick={() => {
              setShowConnectModal(false);
              connect();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition group mb-2.5"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition">
                  Web3 Wallet
                </div>
                <div className="text-[10px] text-slate-400">Freighter, xBull, Albedo, Lobstr</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10">
              Live
            </span>
          </button>

          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-300 px-1 mb-1.5 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Instant 1-Click Demo Sandbox</span>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  connectDemo("tenant");
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-cyan-500/15 border border-slate-700/60 hover:border-cyan-500/40 text-left transition"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Demo Tenant</div>
                    <div className="text-[10px] text-slate-400">5,000 USDC • Test Escrow Locking</div>
                  </div>
                </div>
                <span className="text-[10px] text-cyan-400 font-medium">Connect</span>
              </button>

              <button
                onClick={() => {
                  setShowConnectModal(false);
                  connectDemo("landlord");
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-purple-500/15 border border-slate-700/60 hover:border-purple-500/40 text-left transition"
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Demo Landlord</div>
                    <div className="text-[10px] text-slate-400">Create Leases & Release Deposits</div>
                  </div>
                </div>
                <span className="text-[10px] text-purple-400 font-medium">Connect</span>
              </button>

              <button
                onClick={() => {
                  setShowConnectModal(false);
                  connectDemo("arbiter");
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-amber-500/15 border border-slate-700/60 hover:border-amber-500/40 text-left transition"
              >
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Demo Arbiter</div>
                    <div className="text-[10px] text-slate-400">Review Claims & Split Rulings</div>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-medium">Connect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
