import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Background3D } from "@/components/layout/Background3D";
import { TransactionToast } from "@/components/transactions/TransactionToast";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StellarVault | Trustless Rental Deposit Escrow",
  description:
    "Lock rental deposits on-chain with automatic checkout release and transparent arbitration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased font-sans selection:bg-cyan-500/30 selection:text-cyan-200 min-h-screen text-slate-100 relative">
        <Background3D />
        <div className="flex flex-col min-h-screen relative z-10">
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
