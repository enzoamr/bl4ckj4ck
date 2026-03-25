"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

// ─── Floating card decorations ────────────────────────────────────────────────

const DECO_CARDS = [
  { rank: "A", suit: "♠", x: "8%",  y: "20%", rot: -15, delay: 0 },
  { rank: "K", suit: "♥", x: "78%", y: "15%", rot: 12,  delay: 0.2 },
  { rank: "Q", suit: "♦", x: "85%", y: "65%", rot: -8,  delay: 0.4 },
  { rank: "J", suit: "♣", x: "5%",  y: "70%", rot: 18,  delay: 0.1 },
  { rank: "7", suit: "♦", x: "50%", y: "8%",  rot: 5,   delay: 0.3 },
];

function DecoCard({
  rank, suit, x, y, rot, delay,
}: {
  rank: string; suit: string; x: string; y: string; rot: number; delay: number;
}) {
  const red = suit === "♥" || suit === "♦";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.18, scale: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale:   { duration: 0.6, delay },
        y:       { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className="absolute w-16 h-24 bg-white rounded-lg shadow-xl flex flex-col justify-between p-2 pointer-events-none select-none"
      style={{ left: x, top: y, rotate: rot }}
    >
      <div className={`text-sm font-bold ${red ? "text-red-600" : "text-gray-900"}`}>
        <div>{rank}</div>
        <div className="text-xs">{suit}</div>
      </div>
      <div className={`text-2xl text-center ${red ? "text-red-600" : "text-gray-900"}`}>
        {suit}
      </div>
      <div className={`text-sm font-bold rotate-180 ${red ? "text-red-600" : "text-gray-900"}`}>
        <div>{rank}</div>
        <div className="text-xs">{suit}</div>
      </div>
    </motion.div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { setMode, connectWallet, isConnecting } = useGameStore();

  const handleFree = () => {
    setMode("free");
    router.push("/game");
  };

  const handleCrypto = async () => {
    try {
      await connectWallet();
      router.push("/game");
    } catch {
      router.push("/game");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-casino-black flex flex-col items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-casino-felt/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-casino-gold/5 blur-[80px]" />
      </div>

      {/* Floating deco cards */}
      {DECO_CARDS.map((c, i) => <DecoCard key={i} {...c} />)}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-[2px] bg-gradient-to-r from-transparent to-casino-gold/60" />
            <span className="text-casino-gold/60 text-xs tracking-[0.4em] uppercase font-mono">
              Crypto Casino
            </span>
            <div className="w-10 h-[2px] bg-gradient-to-l from-transparent to-casino-gold/60" />
          </div>

          <h1 className="text-gold-shimmer text-7xl font-display font-bold tracking-tight leading-none">
            Bl4ckJ4ck
          </h1>

          <p className="text-white/40 text-sm tracking-widest mt-2 font-mono">
            DECENTRALIZED · FAIR · BEAUTIFUL
          </p>
        </motion.div>

        {/* Divider with suits */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-4 w-full"
        >
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-casino-gold/30" />
          <div className="flex gap-2 text-casino-gold/40 text-lg">
            <span>♠</span><span>♥</span><span>♦</span><span>♣</span>
          </div>
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-casino-gold/30" />
        </motion.div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 w-full"
        >
          {[
            { icon: "🃏", label: "Real Cards", sub: "6-deck shoe" },
            { icon: "⛓️", label: "On-Chain", sub: "ETH / Polygon" },
            { icon: "⚡", label: "Instant", sub: "Deposit & withdraw" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1 p-3 bg-white/3 rounded-xl border border-white/5"
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-white/80 text-xs font-bold tracking-wide">{f.label}</span>
              <span className="text-white/30 text-[10px]">{f.sub}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3 w-full"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFree}
            className="w-full py-4 rounded-2xl bg-casino-gold text-casino-black font-bold text-base tracking-wider uppercase shadow-glow hover:bg-casino-gold-light transition-colors"
          >
            Play Free — 1,000 chips
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCrypto}
            disabled={isConnecting}
            className="w-full py-4 rounded-2xl bg-transparent border-2 border-casino-gold/50 text-casino-gold font-bold text-base tracking-wider uppercase hover:bg-casino-gold/10 transition-colors disabled:opacity-60"
          >
            {isConnecting ? "Connecting…" : "Play with Crypto"}
          </motion.button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/20 text-xs text-center leading-relaxed"
        >
          Blackjack pays 3:2 · Dealer stands on soft 17 · Double on any two cards
        </motion.p>
      </div>

      {/* Bottom corner label */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="text-white/10 text-[10px] tracking-widest font-mono uppercase">
          Play responsibly · Age 18+
        </span>
      </div>
    </main>
  );
}
