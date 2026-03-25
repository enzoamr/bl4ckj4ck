"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { useGameStore, getBalance } from "@/store/gameStore";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";

export default function WalletPanel() {
  const { address, isConnecting, connectWallet, disconnectWallet, mode, setMode } =
    useGameStore();

  const balance       = useGameStore(getBalance);
  const walletBalance = useGameStore((s) => s.walletBalance);

  const [showDeposit,  setShowDeposit]  = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const shortAddr = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap justify-end">

        {/* Mode toggle */}
        <div className="flex bg-white/5 rounded-full p-0.5 border border-white/10">
          <button
            onClick={() => setMode("free")}
            className={clsx(
              "px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all",
              mode === "free"
                ? "bg-casino-gold text-casino-black shadow-glow"
                : "text-white/40 hover:text-white/70"
            )}
          >
            Free
          </button>
          <button
            onClick={() => { if (!address) connectWallet(); else setMode("real"); }}
            className={clsx(
              "px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all",
              mode === "real"
                ? "bg-casino-gold text-casino-black shadow-glow"
                : "text-white/40 hover:text-white/70"
            )}
          >
            Crypto
          </button>
        </div>

        {/* Wallet not connected */}
        {!address ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={connectWallet}
            disabled={isConnecting}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              "border border-casino-gold/50 text-casino-gold text-xs font-bold",
              "hover:bg-casino-gold/10 transition-colors uppercase tracking-wider",
              isConnecting && "opacity-60 cursor-wait"
            )}
          >
            <WalletIcon />
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </motion.button>
        ) : (
          <div className="flex items-center gap-2">
            {/* Chip balance */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
              <span className="text-casino-gold text-xs font-mono tabular-nums font-bold">
                {balance.toLocaleString()}
              </span>
              <span className="text-white/30 text-xs">chips</span>
            </div>

            {mode === "real" && (
              <>
                <button
                  onClick={() => setShowDeposit(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-green-400 border border-green-500/30 hover:bg-green-500/10 transition-colors uppercase tracking-wider"
                >
                  Deposit
                </button>
                <button
                  onClick={() => setShowWithdraw(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors uppercase tracking-wider"
                >
                  Withdraw
                </button>
              </>
            )}

            {/* Address pill */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
              <span className="text-white/60 text-xs font-mono">{shortAddr}</span>
              <button
                onClick={disconnectWallet}
                className="text-white/20 hover:text-white/50 transition-colors text-xs ml-1"
                title="Disconnect"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDeposit  && <DepositModal  onClose={() => setShowDeposit(false)} />}
        {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
      </AnimatePresence>
    </>
  );
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
