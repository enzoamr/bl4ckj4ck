"use client";

import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useGameStore } from "@/store/gameStore";
import HandDisplay from "./Hand";
import BetPanel from "./BetPanel";
import GameControls from "./GameControls";
export default function Table() {
  const { phase, dealerCards, playerHands, activeHandIndex } = useGameStore();

  const showDealer = phase !== "idle" && phase !== "betting";
  const isResult   = phase === "result";

  return (
    <div className="relative w-full flex flex-col items-center justify-between min-h-[600px] py-8 px-4">

      {/* ── Dealer zone ── */}
      <div className="flex flex-col items-center gap-3 min-h-[160px] justify-end">
        <AnimatePresence>
          {showDealer && (
            <motion.div
              key="dealer-area"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <HandDisplay
                cards={dealerCards}
                label="Dealer"
                isActive={phase === "dealer-turn"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Table center decoration ── */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute w-64 h-[1px] bg-gradient-to-r from-transparent via-casino-gold/30 to-transparent" />
        <AnimatePresence>
          {(phase === "idle" || phase === "betting") && (
            <motion.div
              key="center-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative px-6 py-2 text-center"
            >
              <div className="text-casino-gold/30 text-xs tracking-[0.3em] uppercase font-mono">
                Blackjack Pays 3 to 2
              </div>
              <div className="text-white/10 text-[10px] tracking-[0.2em] mt-0.5 uppercase font-mono">
                Dealer Must Stand on 17
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Player zone ── */}
      <div className="flex flex-col items-center gap-6 min-h-[200px]">
        {/* Player hands */}
        <AnimatePresence>
          {playerHands.length > 0 && (
            <motion.div
              key="player-hands"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={clsx(
                "flex items-start gap-8",
                playerHands.length > 1 && "gap-12"
              )}
            >
              {playerHands.map((hand, i) => (
                <div key={i} className="relative flex flex-col items-center">
                  {/* Split hand indicator */}
                  {playerHands.length > 1 && (
                    <div
                      className={clsx(
                        "mb-1 text-[10px] uppercase tracking-widest font-mono",
                        i === activeHandIndex && phase !== "result"
                          ? "text-casino-gold"
                          : "text-white/30"
                      )}
                    >
                      Hand {i + 1}
                    </div>
                  )}
                  <HandDisplay
                    cards={hand.cards}
                    label={playerHands.length === 1 ? "You" : undefined}
                    isActive={i === activeHandIndex && (phase === "playing" || phase === "split-turn")}
                    result={isResult ? hand.result ?? undefined : undefined}
                  />
                  {/* Bet badge */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-white/30 text-xs">Bet:</span>
                    <span className="text-casino-gold text-xs font-bold tabular-nums">
                      {hand.bet.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          {(phase === "idle" || phase === "betting") ? (
            <BetPanel />
          ) : (
            <GameControls />
          )}
        </div>
      </div>

      {/* ── Dealer turn spinner ── */}
      <AnimatePresence>
        {phase === "dealer-turn" && (
          <motion.div
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <div className="bg-casino-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-casino-gold/20">
              <span className="text-casino-gold/70 text-xs uppercase tracking-widest font-mono">
                Dealer's Turn…
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
