// ─── Card & Deck ─────────────────────────────────────────────────────────────

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;        // unique id for animations
  hidden?: boolean;  // dealer hole card
}

// ─── Game State ───────────────────────────────────────────────────────────────

export type GamePhase =
  | "idle"         // no game started
  | "betting"      // choosing bet amount
  | "dealing"      // animation in progress
  | "playing"      // player's turn
  | "split-turn"   // player playing second split hand
  | "dealer-turn"  // dealer reveals and hits
  | "result";      // round over

export type GameResult = "blackjack" | "win" | "lose" | "push" | null;

export interface HandState {
  cards: Card[];
  bet: number;
  result: GameResult;
  doubled: boolean;
}

// ─── App Mode ─────────────────────────────────────────────────────────────────

export type GameMode = "free" | "real";

// ─── Chip denominations ───────────────────────────────────────────────────────

export interface ChipDef {
  value: number;
  label: string;
  color: string;
  border: string;
  text: string;
}

export const CHIPS: ChipDef[] = [
  { value: 5,    label: "5",    color: "#e74c3c", border: "#c0392b", text: "#fff" },
  { value: 25,   label: "25",   color: "#2ecc71", border: "#27ae60", text: "#fff" },
  { value: 100,  label: "100",  color: "#2c3e50", border: "#1a252f", text: "#d4af37" },
  { value: 500,  label: "500",  color: "#9b59b6", border: "#6c3483", text: "#fff" },
  { value: 1000, label: "1K",   color: "#d4af37", border: "#9a7d20", text: "#000" },
];

// ─── Firebase User doc ────────────────────────────────────────────────────────

export interface UserDoc {
  address: string;
  balance: number;   // in chips (1 ETH = 1000 chips)
  totalWins: number;
  totalLosses: number;
  createdAt: number;
  updatedAt: number;
}
