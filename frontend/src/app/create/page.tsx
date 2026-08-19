"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEscrow } from "@/hooks/useEscrow";
import { useWallet } from "@/hooks/useWallet";
import {
  PlusCircle,
  Shield,
  ArrowRight,
  Loader2,
  HelpCircle,
  Coins,
  Calendar,
  UserCheck,
} from "lucide-react";

export default function CreateEscrowPage() {
  const router = useRouter();
  const { address, isConnected, connect, networkConfig } = useWallet();
  const { createEscrow } = useEscrow();

  const [tenantAddress, setTenantAddress] = useState("");
  const [tokenType, setTokenType] = useState<"USDC" | "XLM" | "CUSTOM">("USDC");
  const [customToken, setCustomToken] = useState("");
  const [depositAmount, setDepositAmount] = useState("1200");
  const [inspectionDays, setInspectionDays] = useState(7);
  const [arbiterContract, setArbiterContract] = useState(
    networkConfig.arbitrationContractId || "CBVU37P2N6F5VNJT77FZX2J2X2V6P5VNJT77FZ"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getTokenAddress = () => {
    if (tokenType === "USDC") return networkConfig.usdcAssetContract || "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWUIE3USSTHZX5I6INT";
    if (tokenType === "XLM") return "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"; // Native SAC wrapper
    return customToken;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isConnected || !address) {
      connect();
      return;
    }

    if (!tenantAddress || !tenantAddress.startsWith("G") || tenantAddress.length !== 56) {
      setErrorMsg("Please enter a valid 56-character Stellar public key for the Tenant.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createEscrow({
        landlord: address,
        tenant: tenantAddress,
        token: getTokenAddress(),
        depositAmount,
        inspectionDays: Number(inspectionDays),
        arbiterContract,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create escrow transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2.5">
          <PlusCircle className="w-6 h-6 text-cyan-400" />
          <span>Create Rental Deposit Escrow</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Lock the tenant security deposit inside a trustless Soroban smart contract with automated timelocks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel-glow p-8 rounded-3xl space-y-6">
        {/* Landlord Address Display */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-medium flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Landlord Address (You)</span>
          </label>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-cyan-300">
            {address ? address : "Wallet not connected - please connect first"}
          </div>
        </div>

        {/* Tenant Public Key */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-medium flex items-center space-x-1.5">
            <span>Tenant Stellar Public Key (G...)</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. GB7X2M...56 character Stellar address"
            value={tenantAddress}
            onChange={(e) => setTenantAddress(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Asset Selection & Deposit Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center space-x-1.5">
              <Coins className="w-3.5 h-3.5 text-purple-400" />
              <span>Deposit Asset</span>
            </label>
            <select
              value={tokenType}
              onChange={(e: any) => setTokenType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
            >
              <option value="USDC">USDC (Stablecoin)</option>
              <option value="XLM">XLM (Native Stellar)</option>
              <option value="CUSTOM">Custom SAC Address</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Deposit Amount</label>
            <input
              type="number"
              step="any"
              required
              min="1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {tokenType === "CUSTOM" && (
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-300 font-medium">Custom SAC Token Address (C...)</label>
            <input
              type="text"
              required
              placeholder="e.g. CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWUIE3USSTHZX5I6INT"
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* Inspection Days & Arbiter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspection Window (Days)</span>
            </label>
            <input
              type="number"
              min="1"
              max="60"
              required
              value={inspectionDays}
              onChange={(e) => setInspectionDays(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400">
              Dispute-free period before tenant can trigger auto-release.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Arbitration Contract Address</span>
            </label>
            <input
              type="text"
              required
              value={arbiterContract}
              onChange={(e) => setArbiterContract(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>Deploy Escrow Agreement</span>
          </button>
        </div>
      </form>
    </div>
  );
}
