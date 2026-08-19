"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useWalletStore, NETWORK_CONFIGS } from "@/state/walletStore";
import { StellarNetwork } from "@/types/stellar";
import {
  Settings,
  Globe,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  ExternalLink,
  Droplet,
} from "lucide-react";

export default function SettingsPage() {
  const { network, setNetwork, networkConfig } = useWallet();
  const [escrowOverride, setEscrowOverride] = useState(networkConfig.escrowContractId);
  const [arbOverride, setArbOverride] = useState(networkConfig.arbitrationContractId);
  const [rpcOverride, setRpcOverride] = useState(networkConfig.rpcUrl);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    NETWORK_CONFIGS[network].escrowContractId = escrowOverride;
    NETWORK_CONFIGS[network].arbitrationContractId = arbOverride;
    NETWORK_CONFIGS[network].rpcUrl = rpcOverride;
    setNetwork(network); // trigger refresh
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>Network & Contract Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure Soroban RPC connections, active networks, and deployed contract address overrides
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel-glow p-6 sm:p-8 rounded-3xl space-y-6">
        {/* Network Picker */}
        <div className="space-y-2 text-xs">
          <label className="text-slate-300 font-semibold flex items-center space-x-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Target Stellar Network</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["TESTNET", "MAINNET", "FUTURENET", "LOCAL"] as StellarNetwork[]).map((net) => (
              <button
                type="button"
                key={net}
                onClick={() => {
                  setNetwork(net);
                  setEscrowOverride(NETWORK_CONFIGS[net].escrowContractId);
                  setArbOverride(NETWORK_CONFIGS[net].arbitrationContractId);
                  setRpcOverride(NETWORK_CONFIGS[net].rpcUrl);
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold transition ${
                  network === net
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {net}
              </button>
            ))}
          </div>
        </div>

        {/* Soroban RPC Endpoint */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-medium">Soroban RPC URL</label>
          <input
            type="url"
            required
            value={rpcOverride}
            onChange={(e) => setRpcOverride(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Escrow Contract ID */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-medium flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rental Escrow Contract ID (C...)</span>
          </label>
          <input
            type="text"
            required
            value={escrowOverride}
            onChange={(e) => setEscrowOverride(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Arbitration Contract ID */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-medium flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Arbitration Contract ID (C...)</span>
          </label>
          <input
            type="text"
            required
            value={arbOverride}
            onChange={(e) => setArbOverride(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Testnet Faucet link */}
        {network === "TESTNET" && (
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 text-cyan-300">
              <Droplet className="w-4 h-4 text-cyan-400" />
              <span>Need testnet XLM for gas fees? Fund your account on Friendbot.</span>
            </div>
            <a
              href="https://laboratory.stellar.org/#account-creator"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-cyan-400 hover:underline font-semibold"
            >
              <span>Friendbot Faucet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {isSaved && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings and contract addresses saved successfully!</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
