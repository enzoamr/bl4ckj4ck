# Bl4ckJ4ck — Crypto Blackjack Casino

Full online blackjack with decentralized ETH payments, built with Next.js + Firebase + Solidity.

## Stack

| Layer    | Tech                               |
|----------|------------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind   |
| Animations | Framer Motion                    |
| State    | Zustand (persisted)                |
| Backend  | Firebase Firestore                 |
| Crypto   | ethers.js v6, MetaMask             |
| Contract | Solidity 0.8.20 (Polygon/ETH)      |
| Deploy   | Vercel (frontend)                  |

## Features

- **Free Mode** — play instantly with 1,000 chips (no wallet needed)
- **Crypto Mode** — connect MetaMask, deposit ETH → chips, play, withdraw
- **On-chain vault** — Solidity contract holds funds (non-custodial)
- **Full blackjack rules** — Hit, Stand, Double Down, Split (one level)
- **Beautiful casino UI** — felt table, animated cards, chip betting
- **6-deck shoe** — shuffled on each game start
- **Dealer hits soft 17** — standard Vegas rules
- **Blackjack pays 3:2**

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Fill in your Firebase + contract values

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
# Firebase (create project at console.firebase.google.com)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Smart contract (optional — needed for real crypto mode)
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=137
```

> **Note**: The app works in **free mode** without any env vars. Firebase and the contract are only needed for real crypto play.

## Deploy Smart Contract

```bash
cd contracts
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygon
```

Set the deployed address in `NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS`.

## Deploy to Vercel

```bash
vercel --prod
```

Add all env vars in the Vercel dashboard under Project → Settings → Environment Variables.

## Deploy Firebase

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

## Chip Conversion

| Chips  | ETH     |
|--------|---------|
| 1,000  | 1 ETH   |
| 100    | 0.1 ETH |
| 5      | 0.005 ETH |

## Blackjack Rules

- 6 deck shoe, reshuffled when < 52 cards remain
- Dealer stands on hard 17, hits on soft 16 and below, hits soft 17
- Blackjack pays 3:2
- Double down on any two cards
- Split on any matching pair (one level)
- No insurance (keeps it simple)
