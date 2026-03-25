"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { Card as CardType } from "@/types";

// ─── Suit helpers ─────────────────────────────────────────────────────────────

const RED_SUITS = new Set(["♥", "♦"]);

function isRed(card: CardType) {
  return RED_SUITS.has(card.suit);
}

// Face card art (simple unicode art, looks classy)
const FACE_ART: Record<string, string> = {
  J: "J",
  Q: "Q",
  K: "K",
};

// ─── Card back design ─────────────────────────────────────────────────────────

function CardBack({ small }: { small?: boolean }) {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-[#1a237e] to-[#0d47a1]",
        "rounded-[6px] w-full h-full"
      )}
    >
      {/* Diamond pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            rgba(255,255,255,0.15) 8px,
            rgba(255,255,255,0.15) 9px
          )`,
        }}
      />
      <div
        className={clsx(
          "border-2 border-white/30 rounded",
          small ? "w-5 h-7" : "w-10 h-14"
        )}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className={clsx("text-white/40 font-bold", small ? "text-xs" : "text-lg")}>
            ♦
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Single card component ────────────────────────────────────────────────────

interface CardProps {
  card: CardType;
  index?: number;
  small?: boolean;
  className?: string;
}

export default function Card({ card, index = 0, small = false, className }: CardProps) {
  const red = isRed(card);
  const isFace = ["J", "Q", "K"].includes(card.rank);

  const width  = small ? "w-12" : "w-[72px]";
  const height = small ? "h-16" : "h-[100px]";

  return (
    <motion.div
      initial={{ y: -80, opacity: 0, rotate: -8 }}
      animate={{ y: 0,  opacity: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 22,
        delay: index * 0.12,
      }}
      className={clsx(width, height, "relative flex-shrink-0", className)}
    >
      {card.hidden ? (
        <CardBack small={small} />
      ) : (
        <div
          className={clsx(
            "w-full h-full bg-white rounded-[6px] shadow-card",
            "flex flex-col justify-between p-[4px]",
            "select-none"
          )}
        >
          {/* Top left */}
          <div className={clsx("flex flex-col items-start leading-none", red ? "text-[#c0392b]" : "text-[#1a1a2e]")}>
            <span className={clsx("font-bold", small ? "text-[10px]" : "text-[13px]")}>
              {card.rank}
            </span>
            <span className={clsx(small ? "text-[9px]" : "text-[11px]")}>
              {card.suit}
            </span>
          </div>

          {/* Center */}
          <div className="flex-1 flex items-center justify-center">
            {isFace ? (
              <span
                className={clsx(
                  "font-display font-bold",
                  red ? "text-[#c0392b]" : "text-[#1a1a2e]",
                  small ? "text-[18px]" : "text-[32px]"
                )}
              >
                {FACE_ART[card.rank]}
              </span>
            ) : card.rank === "A" ? (
              <span
                className={clsx(
                  red ? "text-[#c0392b]" : "text-[#1a1a2e]",
                  small ? "text-[20px]" : "text-[36px]"
                )}
              >
                {card.suit}
              </span>
            ) : (
              <SuitGrid rank={card.rank} suit={card.suit} red={red} small={small} />
            )}
          </div>

          {/* Bottom right (rotated) */}
          <div
            className={clsx(
              "flex flex-col items-end leading-none rotate-180",
              red ? "text-[#c0392b]" : "text-[#1a1a2e]"
            )}
          >
            <span className={clsx("font-bold", small ? "text-[10px]" : "text-[13px]")}>
              {card.rank}
            </span>
            <span className={clsx(small ? "text-[9px]" : "text-[11px]")}>
              {card.suit}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Suit grid for number cards ───────────────────────────────────────────────

function SuitGrid({
  rank,
  suit,
  red,
  small,
}: {
  rank: string;
  suit: string;
  red: boolean;
  small?: boolean;
}) {
  const n = parseInt(rank, 10);
  const cls = clsx(red ? "text-[#c0392b]" : "text-[#1a1a2e]", small ? "text-[8px]" : "text-[11px]");

  const cols = n <= 3 ? 1 : 2;
  const suits = Array(n).fill(suit);

  if (n === 1) return <span className={clsx(cls, "text-[24px]")}>{suit}</span>;

  return (
    <div
      className="grid gap-[1px] items-center justify-center"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {suits.map((s, i) => (
        <span key={i} className={cls}>
          {s}
        </span>
      ))}
    </div>
  );
}
