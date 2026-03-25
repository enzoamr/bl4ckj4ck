"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useGameStore } from "@/store/gameStore";
import { ethToChips } from "@/lib/crypto";
import toast from "react-hot-toast";

const PRESETS = ["0.01", "0.05", "0.1", "0.5", "1"];

interface Props {
  onClose: () => void;
}

export default function DepositModal({ onClose }: Props) {
  const [amount, setAmount] = useState("0.1");
  const { deposit, isDepositing, walletBalance } = useGameStore();

  const chips = ethToChips(amount);
  const validAmount = parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(walletBalance);

  const handleDeposit = async () => {
    if (!validAmount) return;
    try {
      await deposit(amount);
      toast.success(`Deposited ${chips.toLocaleString()} chips!`);
      onClose();
    } catch (e) {
      toast.error((e as Error).message || "Deposit failed");
    }
  };

  return (
    <Overlay onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-casino-surface border border-casino-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-casino-gold font-bold text-lg tracking-wide">
            Deposit ETH
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-xl leading-none">
            ×
          </button>
        </div>

        {/* Wallet balance */}
        <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Wallet balance</span>
            <span className="text-white/70 font-mono">
              {parseFloat(walletBalance).toFixed(4)} ETH
            </span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-white/40">1 ETH</span>
            <span className="text-white/70">= 1,000 chips</span>
          </div>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={clsx(
                "py-1.5 rounded-lg text-xs font-bold transition-all border",
                amount === p
                  ? "bg-casino-gold text-casino-black border-casino-gold"
                  : "bg-white/5 text-white/50 border-white/10 hover:border-white/30"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="relative mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0.001"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-casino-gold/50 transition-colors"
            placeholder="0.1"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">
            ETH
          </span>
        </div>

        {/* Chips preview */}
        {chips > 0 && (
          <div className="mb-6 text-center">
            <span className="text-white/40 text-sm">You receive </span>
            <span className="text-casino-gold font-bold text-lg tabular-nums">
              {chips.toLocaleString()}
            </span>
            <span className="text-white/40 text-sm"> chips</span>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleDeposit}
          disabled={!validAmount || isDepositing}
          className={clsx(
            "w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all",
            validAmount && !isDepositing
              ? "bg-casino-gold text-casino-black hover:bg-casino-gold-light shadow-glow"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          {isDepositing ? "Processing…" : "Deposit"}
        </button>
      </motion.div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}
