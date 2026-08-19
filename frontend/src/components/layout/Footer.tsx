import { ShieldCheck, ExternalLink, Github, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-slate-950/60 backdrop-blur-xl py-8 mt-20 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded-md bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <span className="text-slate-300 font-medium">
            StellarVault • Trustless On-Chain Rental Deposit Escrow
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <a
            href="https://developers.stellar.org"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 hover:text-cyan-300 transition-colors"
          >
            <span>Stellar Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 hover:text-cyan-300 transition-colors"
          >
            <span>StellarExpert</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
          <a
            href="https://github.com/shivang-tech-3/rental-deposit-escrow"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 hover:text-cyan-300 transition-colors"
          >
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
