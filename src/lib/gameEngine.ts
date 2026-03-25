import type { Card, Rank, Suit, GameResult, HandState } from "@/types";

// ─── Deck ─────────────────────────────────────────────────────────────────────

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

export function createDeck(numDecks = 6): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, id: `${d}-${suit}-${rank}` });
      }
    }
  }
  return shuffle(deck);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Card values ──────────────────────────────────────────────────────────────

export function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank, 10);
}

/** Returns { value, soft } for a hand. `soft` = hand contains a usable ace as 11. */
export function handTotal(cards: Card[]): { value: number; soft: boolean } {
  let total = 0;
  let aces = 0;

  for (const c of cards) {
    if (c.hidden) continue;
    total += cardValue(c.rank);
    if (c.rank === "A") aces++;
  }

  // Reduce aces from 11 → 1 if bust
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return { value: total, soft: aces > 0 };
}

// ─── Predicates ──────────────────────────────────────────────────────────────

export function isBust(cards: Card[]): boolean {
  return handTotal(cards).value > 21;
}

export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const { value } = handTotal(cards);
  return value === 21;
}

export function canSplit(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return cardValue(cards[0].rank) === cardValue(cards[1].rank);
}

export function canDouble(cards: Card[]): boolean {
  return cards.length === 2;
}

/** Dealer must hit on soft 16 and below, stand on hard/soft 17+ */
export function dealerShouldHit(cards: Card[]): boolean {
  const { value, soft } = handTotal(cards);
  if (value < 17) return true;
  if (value === 17 && soft) return true; // hit soft 17
  return false;
}

// ─── Round resolution ─────────────────────────────────────────────────────────

export function resolveHand(
  playerHand: HandState,
  dealerCards: Card[]
): GameResult {
  const playerTotal = handTotal(playerHand.cards).value;
  const dealerTotal = handTotal(dealerCards).value;
  const playerBJ    = isBlackjack(playerHand.cards);
  const dealerBJ    = isBlackjack(dealerCards);

  if (isBust(playerHand.cards)) return "lose";
  if (playerBJ && dealerBJ)     return "push";
  if (playerBJ)                 return "blackjack";  // pays 3:2
  if (dealerBJ)                 return "lose";
  if (isBust(dealerCards))      return "win";
  if (playerTotal > dealerTotal) return "win";
  if (playerTotal < dealerTotal) return "lose";
  return "push";
}

/** Calculate payout multiplier for a result */
export function payoutMultiplier(result: GameResult): number {
  switch (result) {
    case "blackjack": return 2.5;  // bet + 1.5x
    case "win":       return 2;    // bet + 1x
    case "push":      return 1;    // return bet
    case "lose":      return 0;    // lose bet
    default:          return 0;
  }
}

/** Calculate net chip delta for a hand */
export function netDelta(result: GameResult, bet: number): number {
  const multi = payoutMultiplier(result);
  return Math.round(bet * multi - bet);
}

// ─── Label helpers ────────────────────────────────────────────────────────────

export function resultLabel(result: GameResult): string {
  switch (result) {
    case "blackjack": return "BLACKJACK!";
    case "win":       return "YOU WIN!";
    case "lose":      return "DEALER WINS";
    case "push":      return "PUSH";
    default:          return "";
  }
}

export function resultColor(result: GameResult): string {
  switch (result) {
    case "blackjack": return "text-casino-gold-light";
    case "win":       return "text-green-400";
    case "lose":      return "text-red-400";
    case "push":      return "text-gray-300";
    default:          return "";
  }
}

export function handLabel(cards: Card[]): string {
  const { value, soft } = handTotal(cards);
  if (isBust(cards)) return "BUST";
  if (isBlackjack(cards)) return "Blackjack!";
  return soft && value < 21 ? `Soft ${value}` : `${value}`;
}
