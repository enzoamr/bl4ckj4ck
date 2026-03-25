"use client";

import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import type { Card as CardType, GameResult } from "@/types";
import { handLabel } from "@/lib/gameEngine";

interface HandProps {
  cards: CardType[];
  label?: string;
  isActive?: boolean;
  result?: GameResult;
  small?: boolean;
}

export default function HandDisplay({ cards, label, isActive, result, small }: HandProps) {
  const visibleCards = cards.filter((c) => !c.hidden);
  const total = visibleCards.length > 0 ? handLabel(visibleCards) : null;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label + score row */}
      <div className="flex items-center gap-3 h-6">
        {label && (
          <span className="text-casino-gold/70 text-xs font-mono uppercase tracking-widest">
            {label}
          </span>
        )}
        {total && (
          <span
            className={clsx(
              "px-2 py-0.5 rounded text-sm font-bold tabular-nums transition-all",
              isActive
                ? "bg-casino-gold text-casino-black shadow-glow"
                : "bg-white/10 text-white/80"
            )}
          >
            {total}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className={clsx("flex items-end", small ? "-space-x-4" : "-space-x-5")}>
        {cards.map((card, i) => (
          <Card key={card.id} card={card} index={i} small={small} />
        ))}
      </div>

      {/* Result badge */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <ResultBadge result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Result badge ─────────────────────────────────────────────────────────────

export function ResultBadge({ result }: { result: GameResult }) {
  if (!result) return null;

  const styles: Record<NonNullable<GameResult>, string> = {
    blackjack: "bg-casino-gold/20 text-casino-gold-light border-casino-gold/50 shadow-glow",
    win:       "bg-green-500/20 text-green-400 border-green-500/50 shadow-glow-green",
    lose:      "bg-red-500/20 text-red-400 border-red-500/50 shadow-glow-red",
    push:      "bg-white/10 text-white/60 border-white/20",
  };

  const labels: Record<NonNullable<GameResult>, string> = {
    blackjack: "BLACKJACK!",
    win:       "WIN",
    lose:      "LOSE",
    push:      "PUSH",
  };

  return (
    <div
      className={clsx(
        "px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border",
        styles[result]
      )}
    >
      {labels[result]}
    </div>
  );
}
