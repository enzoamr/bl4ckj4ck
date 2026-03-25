"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import Table from "@/components/Table";
import WalletPanel from "@/components/WalletPanel";

export default function GamePage() {
  const { mode, freeBalance, phase, nextRound } = useGameStore();

  // Auto-refill free chips if broke
  useEffect(() => {
    if (mode === "free" && freeBalance === 0 && phase === "idle") {
      useGameStore.setState({ freeBalance: 1000 });
    }
  }, [freeBalance, mode, phase]);

  return (
    <div className="min-h-screen bg-casino-black flex flex-col">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-casino-dark/80 backdrop-blur-sm sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-casino-gold font-display font-bold text-xl tracking-tight group-hover:text-casino-gold-light transition-colors">
            Bl4ckJ4ck
          </span>
          <span className="text-white/20 text-xs tracking-widest uppercase font-mono hidden sm:block">
            Crypto Casino
          </span>
        </Link>

        <WalletPanel />
      </header>

      {/* ── Game table ── */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative felt table-oval rounded-[50px] w-full max-w-2xl overflow-hidden"
          style={{ minHeight: 560 }}
        >
          <Table />
        </motion.div>
      </main>

      {/* ── Footer strip ── */}
      <footer className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-white/20 text-[10px] font-mono uppercase tracking-widest">
        <span>Blackjack · 6 Deck Shoe</span>
        <ModeIndicator />
        <span>Dealer Stands on 17</span>
      </footer>
    </div>
  );
}

function ModeIndicator() {
  const mode = useGameStore((s) => s.mode);
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          mode === "real"
            ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]"
            : "bg-casino-gold/60"
        }`}
      />
      <span className={mode === "real" ? "text-green-400/70" : "text-casino-gold/50"}>
        {mode === "real" ? "Crypto Mode" : "Free Mode"}
      </span>
    </div>
  );
}
