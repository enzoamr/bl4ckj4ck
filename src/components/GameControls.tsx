"use client";

import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, getBalance } from "@/store/gameStore";
import { canSplit, canDouble, payoutMultiplier } from "@/lib/gameEngine";

// ─── Action button ────────────────────────────────────────────────────────────

type Variant = "primary" | "secondary" | "danger" | "gold";

const variantClasses: Record<Variant, string> = {
  primary:   "bg-green-600 hover:bg-green-500 text-white border-green-700",
  secondary: "bg-white/10 hover:bg-white/20 text-white border-white/20",
  danger:    "bg-red-600/80 hover:bg-red-500 text-white border-red-700",
  gold:      "bg-casino-gold hover:bg-casino-gold-light text-casino-black border-casino-gold-dim",
};

function ActionBtn({
  onClick,
  disabled,
  variant = "secondary",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: Variant;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase",
        "border transition-all duration-150 shadow-lg",
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
        variantClasses[variant]
      )}
    >
      {children}
    </motion.button>
  );
}

// ─── Result summary ───────────────────────────────────────────────────────────

function ResultSummary() {
  const playerHands = useGameStore((s) => s.playerHands);

  const mainResult = playerHands[0]?.result ?? null;

  const resultDisplay: Record<string, { label: string; cls: string }> = {
    blackjack: { label: "BLACKJACK! 🎰", cls: "text-casino-gold-light" },
    win:       { label: "YOU WIN! 🎉",   cls: "text-green-400" },
    lose:      { label: "DEALER WINS",   cls: "text-red-400" },
    push:      { label: "PUSH",          cls: "text-gray-300" },
  };

  const display = mainResult ? resultDisplay[mainResult] : null;

  const totalBet    = playerHands.reduce((acc, h) => acc + h.bet, 0);
  const totalPayout = playerHands.reduce(
    (acc, h) => acc + Math.round(h.bet * payoutMultiplier(h.result)),
    0
  );
  const net = totalPayout - totalBet;

  return (
    <div className="flex flex-col items-center gap-1 mb-2">
      {display && (
        <span className={clsx("text-2xl font-bold tracking-wide", display.cls)}>
          {display.label}
        </span>
      )}
      <span
        className={clsx(
          "text-lg font-bold tabular-nums",
          net > 0 ? "text-green-400" : net < 0 ? "text-red-400" : "text-gray-400"
        )}
      >
        {net > 0 ? `+${net.toLocaleString()}` : net === 0 ? "±0" : net.toLocaleString()} chips
      </span>
    </div>
  );
}

// ─── Main controls ────────────────────────────────────────────────────────────

export default function GameControls() {
  const { phase, hit, stand, double, split, nextRound, playerHands, activeHandIndex } =
    useGameStore();

  const balance    = useGameStore(getBalance);
  const isPlaying  = phase === "playing" || phase === "split-turn";
  const isResult   = phase === "result";

  const activeHand = playerHands[activeHandIndex];

  const canSplitHand  = isPlaying && !!activeHand && canSplit(activeHand.cards) && playerHands.length === 1;
  const canDoubleHand = isPlaying && !!activeHand && canDouble(activeHand.cards) && activeHand.bet <= balance;

  return (
    <AnimatePresence mode="wait">
      {isPlaying && (
        <motion.div
          key="playing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="flex items-center gap-3 flex-wrap justify-center"
        >
          <ActionBtn variant="primary" onClick={hit}>Hit</ActionBtn>
          <ActionBtn variant="danger"  onClick={stand}>Stand</ActionBtn>
          {canDoubleHand && (
            <ActionBtn variant="gold" onClick={double}>Double</ActionBtn>
          )}
          {canSplitHand && (
            <ActionBtn variant="secondary" onClick={split}>Split</ActionBtn>
          )}
        </motion.div>
      )}

      {isResult && (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-3"
        >
          <ResultSummary />
          <ActionBtn variant="gold" onClick={nextRound}>Next Round</ActionBtn>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
