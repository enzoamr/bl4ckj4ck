"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { CHIPS } from "@/types";
import { useGameStore, getBalance } from "@/store/gameStore";

export default function BetPanel() {
  const { addBet, clearBet, deal, currentBet, phase } = useGameStore();
  const balance = useGameStore(getBalance);

  const canBet  = phase === "idle" || phase === "betting";
  const canDeal = phase === "betting" && currentBet > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Chips row */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {CHIPS.map((chip) => {
          const disabled = !canBet || chip.value > balance - currentBet;
          return (
            <motion.button
              key={chip.value}
              whileHover={disabled ? {} : { scale: 1.12, y: -4 }}
              whileTap={disabled ? {} : { scale: 0.95 }}
              onClick={() => addBet(chip.value)}
              disabled={disabled}
              className={clsx(
                "relative w-14 h-14 rounded-full flex items-center justify-center",
                "font-bold text-sm shadow-chip select-none transition-opacity",
                "border-[3px] border-b-[5px]",
                disabled && "opacity-30 cursor-not-allowed"
              )}
              style={{
                background: chip.color,
                borderColor: chip.border,
                color: chip.text,
              }}
              title={`+${chip.label} chips`}
            >
              {/* Chip dashes */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <div
                    key={deg}
                    className="absolute w-full h-[2px] top-1/2 -translate-y-1/2"
                    style={{
                      background: `${chip.text}22`,
                      transform: `rotate(${deg}deg)`,
                      transformOrigin: "center",
                    }}
                  />
                ))}
              </div>
              {chip.label}
            </motion.button>
          );
        })}
      </div>

      {/* Bet display + controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-xs uppercase tracking-widest">BET</span>
          <span
            className={clsx(
              "text-2xl font-bold tabular-nums transition-all duration-200",
              currentBet > 0 ? "text-casino-gold" : "text-white/20"
            )}
          >
            {currentBet.toLocaleString()}
          </span>
        </div>

        {currentBet > 0 && phase === "betting" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearBet}
            className="px-3 py-1 text-xs text-white/50 border border-white/20 rounded-full hover:border-white/40 hover:text-white/70 transition-colors"
          >
            Clear
          </motion.button>
        )}

        <motion.button
          whileHover={canDeal ? { scale: 1.05 } : {}}
          whileTap={canDeal ? { scale: 0.97 } : {}}
          onClick={deal}
          disabled={!canDeal}
          className={clsx(
            "px-8 py-2.5 rounded-full font-bold text-sm tracking-wider uppercase transition-all",
            canDeal
              ? "bg-casino-gold text-casino-black shadow-glow cursor-pointer hover:bg-casino-gold-light"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          Deal
        </motion.button>
      </div>

      {/* Balance */}
      <div className="flex items-center gap-1.5 text-xs text-white/30">
        <span>Balance:</span>
        <span className="text-white/50 tabular-nums font-mono">{balance.toLocaleString()}</span>
        <span>chips</span>
      </div>
    </div>
  );
}
