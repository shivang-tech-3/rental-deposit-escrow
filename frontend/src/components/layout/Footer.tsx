import { ShieldCheck, ExternalLink, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950/40 py-8 mt-20 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Stellar Rental Deposit Escrow • Built on Soroban Smart Contracts</span>
        </div>

        <div className="flex items-center space-x-6">
          <a
            href="https://developers.stellar.org"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 hover:text-cyan-400 transition"
          >
            <span>Stellar Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 hover:text-cyan-400 transition"
          >
            <span>StellarExpert</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/shivang-tech-3/rental-deposit-escrow"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 hover:text-cyan-400 transition"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
