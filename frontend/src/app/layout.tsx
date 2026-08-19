import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TransactionToast } from "@/components/transactions/TransactionToast";

export const metadata: Metadata = {
  title: "StellarVault | Trustless Rental Deposit Escrow on Soroban",
  description:
    "Lock rental deposits on-chain with automatic checkout release and transparent arbitration. Powered by Stellar Soroban smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </div>
        <TransactionToast />
      </body>
    </html>
  );
}
