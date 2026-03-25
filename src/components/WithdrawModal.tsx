"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useGameStore } from "@/store/gameStore";
import { chipsToEth } from "@/lib/crypto";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
}

export default function WithdrawModal({ onClose }: Props) {
  const { withdraw, isWithdrawing, realBalance } = useGameStore();
  const [chips, setChips] = useState(100);

  const maxChips  = realBalance;
  const ethAmount = chipsToEth(chips);
  const valid     = chips > 0 && chips <= maxChips;

  const PRESETS = [100, 250, 500, 1000].filter((p) => p <= maxChips);

  const handleWithdraw = async () => {
    if (!valid) return;
    try {
      await withdraw(chips);
      toast.success(`Withdrew ${chips.toLocaleString()} chips → ${parseFloat(ethAmount).toFixed(4)} ETH`);
      onClose();
    } catch (e) {
      toast.error((e as Error).message || "Withdrawal failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-casino-surface border border-casino-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-casino-gold font-bold text-lg tracking-wide">
            Withdraw Chips
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-xl leading-none">
            ×
          </button>
        </div>

        {/* Balance info */}
        <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Your chips</span>
            <span className="text-casino-gold font-mono font-bold">
              {maxChips.toLocaleString()} chips
            </span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-white/40">1,000 chips</span>
            <span className="text-white/70">= 1 ETH</span>
          </div>
        </div>

        {/* Presets */}
        {PRESETS.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setChips(p)}
                className={clsx(
                  "py-1.5 rounded-lg text-xs font-bold transition-all border",
                  chips === p
                    ? "bg-casino-gold text-casino-black border-casino-gold"
                    : "bg-white/5 text-white/50 border-white/10 hover:border-white/30"
                )}
              >
                {p >= 1000 ? `${p / 1000}K` : p}
              </button>
            ))}
          </div>
        )}

        {/* Slider */}
        <div className="mb-2">
          <input
            type="range"
            min={5}
            max={maxChips}
            step={5}
            value={chips}
            onChange={(e) => setChips(parseInt(e.target.value))}
            className="w-full accent-[#d4af37]"
          />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>5</span>
            <span className="text-casino-gold font-bold tabular-nums">
              {chips.toLocaleString()}
            </span>
            <span>{maxChips.toLocaleString()}</span>
          </div>
        </div>

        {/* ETH preview */}
        <div className="mb-6 text-center">
          <span className="text-white/40 text-sm">You receive </span>
          <span className="text-casino-gold font-bold text-lg">
            {parseFloat(ethAmount).toFixed(4)}
          </span>
          <span className="text-white/40 text-sm"> ETH</span>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={!valid || isWithdrawing || maxChips === 0}
          className={clsx(
            "w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all",
            valid && !isWithdrawing && maxChips > 0
              ? "bg-casino-gold text-casino-black hover:bg-casino-gold-light shadow-glow"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          {isWithdrawing ? "Processing…" : maxChips === 0 ? "No chips to withdraw" : "Withdraw"}
        </button>
      </motion.div>
    </motion.div>
  );
}
