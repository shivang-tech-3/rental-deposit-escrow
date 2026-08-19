"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Activity, Layers, Scale, BarChart3, Settings, PlusCircle } from "lucide-react";
import { NetworkBadge } from "./NetworkBadge";
import { ConnectButton } from "../wallet/ConnectButton";
import { clsx } from "clsx";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Escrows", icon: Layers },
    { href: "/create", label: "New Lease", icon: PlusCircle },
    { href: "/arbitration", label: "Arbitration", icon: Scale },
    { href: "/activity", label: "Live Feed", icon: Activity },
    { href: "/transactions", label: "Tx Center", icon: ShieldCheck },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-200 to-purple-300">
                StellarVault
              </span>
              <span className="block text-[10px] text-slate-400 font-mono tracking-wider">
                RENTAL ESCROW
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    isActive
                      ? "bg-slate-800/80 text-cyan-300 border border-slate-700/60 shadow-inner"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  )}
                >
                  <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-cyan-400" : "text-slate-500")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <NetworkBadge />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
