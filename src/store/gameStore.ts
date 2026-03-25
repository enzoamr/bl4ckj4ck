"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Card, GamePhase, GameResult, HandState, GameMode } from "@/types";
import {
  createDeck,
  dealerShouldHit,
  isBlackjack,
  isBust,
  resolveHand,
  payoutMultiplier,
} from "@/lib/gameEngine";
import {
  connectWallet as cwConnect,
  onAccountChanged,
  getWalletBalance,
  depositToVault,
  withdrawFromVault,
  chipsToEth,
  ethToChips,
} from "@/lib/crypto";
import {
  getOrCreateUser,
  updateUserBalance,
  recordGameResult,
  isFirebaseConfigured,
} from "@/lib/firebase";

// ─── State shape ──────────────────────────────────────────────────────────────

interface GameStore {
  // Mode
  mode: GameMode;
  setMode: (m: GameMode) => void;

  // Wallet
  address: string | null;
  walletBalance: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // Balances
  freeBalance: number;
  realBalance: number;
  setRealBalance: (n: number) => void;
  fetchRealBalance: () => Promise<void>;

  // Deposit / Withdraw
  isDepositing: boolean;
  isWithdrawing: boolean;
  deposit: (ethAmount: string) => Promise<void>;
  withdraw: (chipsAmount: number) => Promise<void>;

  // Bet
  currentBet: number;
  addBet: (chips: number) => void;
  clearBet: () => void;

  // Game state
  phase: GamePhase;
  deck: Card[];
  dealerCards: Card[];
  playerHands: HandState[];
  activeHandIndex: number;

  // Actions
  deal: () => void;
  hit: () => void;
  stand: () => void;
  double: () => void;
  split: () => void;
  nextRound: () => void;

  // Error
  errorMsg: string | null;
  setError: (msg: string | null) => void;
}

// ─── Helper to get current balance ────────────────────────────────────────────

export function getBalance(s: GameStore): number {
  return s.mode === "free" ? s.freeBalance : s.realBalance;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ── Mode ────────────────────────────────────────────────────────────────
      mode: "free",
      setMode: (m) => set({ mode: m }),

      // ── Wallet ──────────────────────────────────────────────────────────────
      address: null,
      walletBalance: "0",
      isConnecting: false,

      connectWallet: async () => {
        set({ isConnecting: true, errorMsg: null });
        try {
          const address = await cwConnect();
          set({ address });

          const wb = await getWalletBalance(address);
          set({ walletBalance: wb });

          if (isFirebaseConfigured()) {
            const user = await getOrCreateUser(address);
            set({ realBalance: user.balance });
          }

          set({ mode: "real" });

          onAccountChanged((addr) => {
            if (!addr) set({ address: null, realBalance: 0, mode: "free" });
            else set({ address: addr });
          });
        } catch (e) {
          set({ errorMsg: (e as Error).message });
        } finally {
          set({ isConnecting: false });
        }
      },

      disconnectWallet: () =>
        set({ address: null, walletBalance: "0", realBalance: 0, mode: "free" }),

      // ── Balances ─────────────────────────────────────────────────────────────
      freeBalance: 1000,
      realBalance: 0,

      setRealBalance: (n) => set({ realBalance: n }),

      fetchRealBalance: async () => {
        const { address } = get();
        if (!address || !isFirebaseConfigured()) return;
        const user = await getOrCreateUser(address);
        set({ realBalance: user.balance });
      },

      // ── Deposit / Withdraw ───────────────────────────────────────────────────
      isDepositing: false,
      isWithdrawing: false,

      deposit: async (ethAmount) => {
        const { address } = get();
        if (!address) throw new Error("Wallet not connected");
        set({ isDepositing: true, errorMsg: null });
        try {
          await depositToVault(ethAmount);
          const chips = ethToChips(ethAmount);
          if (isFirebaseConfigured()) {
            await updateUserBalance(address, chips);
            await get().fetchRealBalance();
          } else {
            set((s) => ({ realBalance: s.realBalance + chips }));
          }
          const wb = await getWalletBalance(address);
          set({ walletBalance: wb });
        } catch (e) {
          set({ errorMsg: (e as Error).message });
          throw e;
        } finally {
          set({ isDepositing: false });
        }
      },

      withdraw: async (chips) => {
        const { address, realBalance } = get();
        if (!address) throw new Error("Wallet not connected");
        if (chips > realBalance) throw new Error("Insufficient balance");
        set({ isWithdrawing: true, errorMsg: null });
        try {
          const ethAmount = chipsToEth(chips);
          await withdrawFromVault(ethAmount);
          if (isFirebaseConfigured()) {
            await updateUserBalance(address, -chips);
            await get().fetchRealBalance();
          } else {
            set((s) => ({ realBalance: s.realBalance - chips }));
          }
          const wb = await getWalletBalance(address);
          set({ walletBalance: wb });
        } catch (e) {
          set({ errorMsg: (e as Error).message });
          throw e;
        } finally {
          set({ isWithdrawing: false });
        }
      },

      // ── Bet ──────────────────────────────────────────────────────────────────
      currentBet: 0,

      addBet: (chips) => {
        const s = get();
        if (s.phase !== "idle" && s.phase !== "betting") return;
        const balance = getBalance(s);
        if (s.currentBet + chips > balance) return;
        set({ currentBet: s.currentBet + chips, phase: "betting" });
      },

      clearBet: () => {
        if (get().phase !== "betting") return;
        set({ currentBet: 0, phase: "idle" });
      },

      // ── Game state ───────────────────────────────────────────────────────────
      phase: "idle",
      deck: [],
      dealerCards: [],
      playerHands: [],
      activeHandIndex: 0,

      deal: () => {
        const s = get();
        if (s.currentBet === 0) return;
        const balance = getBalance(s);
        if (s.currentBet > balance) return;

        // Deduct bet
        if (s.mode === "free") set({ freeBalance: s.freeBalance - s.currentBet });
        else set({ realBalance: s.realBalance - s.currentBet });

        let deck = s.deck.length < 52 ? createDeck(6) : s.deck;
        const draw = (): Card => { const [c, ...r] = deck; deck = r; return c; };

        const p1 = draw(), d1 = draw(), p2 = draw();
        const d2: Card = { ...draw(), hidden: true };
        const playerCards = [p1, p2];
        const dealerVisible = [d1, d2];

        const playerHand: HandState = { cards: playerCards, bet: s.currentBet, result: null, doubled: false };

        // Blackjack check
        const playerBJ = isBlackjack(playerCards);
        const revealedD2: Card = { ...d2, hidden: false };
        const dealerBJ = isBlackjack([d1, revealedD2]);

        if (playerBJ || dealerBJ) {
          const revealedDealer = [d1, revealedD2];
          const result = resolveHand(playerHand, revealedDealer);
          const payout = Math.round(s.currentBet * payoutMultiplier(result));
          const finalHand: HandState = { ...playerHand, result };

          set((cur) => ({
            deck,
            dealerCards: revealedDealer,
            playerHands: [finalHand],
            activeHandIndex: 0,
            phase: "result",
            freeBalance: cur.mode === "free" ? cur.freeBalance + payout : cur.freeBalance,
            realBalance: cur.mode === "real" ? cur.realBalance + payout : cur.realBalance,
          }));
          syncResult(get, result, payout - s.currentBet);
          return;
        }

        set({ deck, dealerCards: dealerVisible, playerHands: [playerHand], activeHandIndex: 0, phase: "playing" });
      },

      hit: () => {
        const s = get();
        if (s.phase !== "playing" && s.phase !== "split-turn") return;

        const [card, ...rest] = s.deck;
        const hands = s.playerHands.map((h, i) =>
          i !== s.activeHandIndex ? h : { ...h, cards: [...h.cards, card] }
        );
        const hand = hands[s.activeHandIndex];

        if (isBust(hand.cards)) {
          const updated = hands.map((h, i) =>
            i === s.activeHandIndex ? { ...h, result: "lose" as GameResult } : h
          );
          set({ deck: rest, playerHands: updated });
          advanceOrDealer(set, get, updated, s.activeHandIndex);
          return;
        }
        set({ deck: rest, playerHands: hands });
      },

      stand: () => {
        const { phase, playerHands, activeHandIndex } = get();
        if (phase !== "playing" && phase !== "split-turn") return;
        advanceOrDealer(set, get, playerHands, activeHandIndex);
      },

      double: () => {
        const s = get();
        if (s.phase !== "playing") return;
        const hand = s.playerHands[s.activeHandIndex];
        if (hand.cards.length !== 2) return;
        const balance = getBalance(s);
        if (hand.bet > balance) return;

        // Deduct extra bet
        if (s.mode === "free") set({ freeBalance: s.freeBalance - hand.bet });
        else set({ realBalance: s.realBalance - hand.bet });

        const [card, ...rest] = s.deck;
        const newHand: HandState = {
          ...hand,
          cards: [...hand.cards, card],
          bet: hand.bet * 2,
          doubled: true,
          result: isBust([...hand.cards, card]) ? "lose" : null,
        };
        const updated = s.playerHands.map((h, i) => i === s.activeHandIndex ? newHand : h);
        set({ deck: rest, playerHands: updated });
        advanceOrDealer(set, get, updated, s.activeHandIndex);
      },

      split: () => {
        const s = get();
        if (s.phase !== "playing") return;
        const hand = s.playerHands[s.activeHandIndex];
        if (hand.cards.length !== 2) return;
        const balance = getBalance(s);
        if (hand.bet > balance) return;

        // Deduct extra bet for second hand
        if (s.mode === "free") set({ freeBalance: s.freeBalance - hand.bet });
        else set({ realBalance: s.realBalance - hand.bet });

        let d = [...s.deck];
        const draw = (): Card => { const [c, ...r] = d; d = r; return c; };

        const h1: HandState = { cards: [hand.cards[0], draw()], bet: hand.bet, result: null, doubled: false };
        const h2: HandState = { cards: [hand.cards[1], draw()], bet: hand.bet, result: null, doubled: false };

        const updated = [
          ...s.playerHands.slice(0, s.activeHandIndex),
          h1, h2,
          ...s.playerHands.slice(s.activeHandIndex + 1),
        ];
        set({ deck: d, playerHands: updated, phase: "split-turn" });
      },

      nextRound: () =>
        set({ phase: "idle", currentBet: 0, dealerCards: [], playerHands: [], activeHandIndex: 0 }),

      // ── Helpers ──────────────────────────────────────────────────────────────
      errorMsg: null,
      setError: (msg) => set({ errorMsg: msg }),
    }),
    {
      name: "bl4ckj4ck-store",
      partialize: (s) => ({ freeBalance: s.freeBalance, mode: s.mode }),
    }
  )
);

// ─── Internal helpers ─────────────────────────────────────────────────────────

type SetFn = (partial: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void;
type GetFn = () => GameStore;

function advanceOrDealer(set: SetFn, get: GetFn, hands: HandState[], currentIndex: number) {
  const nextIndex = currentIndex + 1;
  if (nextIndex < hands.length && hands[nextIndex].result === null) {
    set({ playerHands: hands, activeHandIndex: nextIndex, phase: "split-turn" });
    return;
  }
  runDealerTurn(set, get, hands);
}

function runDealerTurn(set: SetFn, get: GetFn, hands: HandState[]) {
  set({ phase: "dealer-turn" });

  let dealerCards = get().dealerCards.map((c) => ({ ...c, hidden: false }));
  let deck = get().deck;

  while (dealerShouldHit(dealerCards)) {
    const [card, ...rest] = deck;
    dealerCards = [...dealerCards, { ...card, hidden: false }];
    deck = rest;
  }

  let totalPayout = 0;
  const resolvedHands = hands.map((h) => {
    if (h.result !== null) return h;
    const result = resolveHand(h, dealerCards);
    totalPayout += Math.round(h.bet * payoutMultiplier(result));
    return { ...h, result };
  });

  const totalBet = resolvedHands.reduce((acc, h) => acc + h.bet, 0);

  set((s) => ({
    deck,
    dealerCards,
    playerHands: resolvedHands,
    phase: "result",
    freeBalance: s.mode === "free" ? s.freeBalance + totalPayout : s.freeBalance,
    realBalance: s.mode === "real" ? s.realBalance + totalPayout : s.realBalance,
  }));

  const anyWin = resolvedHands.some((h) => h.result === "win" || h.result === "blackjack");
  syncResult(get, anyWin ? "win" : "lose", totalPayout - totalBet);
}

async function syncResult(get: GetFn, result: GameResult, net: number) {
  const { address, mode } = get();
  if (mode !== "real" || !address || !isFirebaseConfigured()) return;
  try {
    await recordGameResult(address, result === "win" || result === "blackjack", net);
  } catch {
    // non-critical
  }
}
