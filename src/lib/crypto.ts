import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";

// ─── ABI (minimal vault) ──────────────────────────────────────────────────────

const VAULT_ABI = [
  "function deposit() payable",
  "function withdraw(uint256 amount) external",
  "function balances(address) view returns (uint256)",
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdrawal(address indexed user, uint256 amount)",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS ?? "";
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "137", 10);

// ─── Provider helpers ─────────────────────────────────────────────────────────

export async function getProvider(): Promise<BrowserProvider> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }
  return new BrowserProvider(window.ethereum as Parameters<typeof BrowserProvider>[0]);
}

export async function connectWallet(): Promise<string> {
  const provider = await getProvider();
  const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
  if (!accounts || accounts.length === 0) throw new Error("No accounts found");
  return accounts[0];
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const provider = await getProvider();
    const accounts = (await provider.send("eth_accounts", [])) as string[];
    return accounts?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function switchToCorrectNetwork(): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) return;

  const hexChainId = `0x${CHAIN_ID.toString(16)}`;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 4902 && CHAIN_ID === 137) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x89",
            chainName: "Polygon Mainnet",
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            rpcUrls: ["https://polygon-rpc.com"],
            blockExplorerUrls: ["https://polygonscan.com"],
          },
        ],
      });
    }
  }
}

// ─── Wallet balance ───────────────────────────────────────────────────────────

export async function getWalletBalance(address: string): Promise<string> {
  const provider = await getProvider();
  const bal = await provider.getBalance(address);
  return formatEther(bal);
}

// ─── Contract interactions ────────────────────────────────────────────────────

async function getVaultContract() {
  if (!CONTRACT_ADDRESS) throw new Error("Vault contract address not configured. Set NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS in .env.local");
  const provider = await getProvider();
  const signer   = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, VAULT_ABI, signer);
}

export async function depositToVault(ethAmount: string): Promise<string> {
  const vault = await getVaultContract();
  const tx      = await vault.deposit({ value: parseEther(ethAmount) });
  const receipt = await tx.wait();
  return receipt.hash as string;
}

export async function withdrawFromVault(ethAmount: string): Promise<string> {
  const vault = await getVaultContract();
  const tx      = await vault.withdraw(parseEther(ethAmount));
  const receipt = await tx.wait();
  return receipt.hash as string;
}

export async function getVaultBalance(address: string): Promise<string> {
  if (!CONTRACT_ADDRESS) return "0";
  const provider = await getProvider();
  const vault    = new Contract(CONTRACT_ADDRESS, VAULT_ABI, provider);
  const bal = await vault.balances(address);
  return formatEther(bal as bigint);
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

/** 1 ETH = 1000 chips */
export const ETH_PER_CHIP = 0.001;

export function chipsToEth(chips: number): string {
  return (chips * ETH_PER_CHIP).toFixed(6);
}

export function ethToChips(eth: string): number {
  return Math.floor(parseFloat(eth) / ETH_PER_CHIP);
}

// ─── Wallet event listeners ───────────────────────────────────────────────────

export function onAccountChanged(cb: (address: string | null) => void): () => void {
  if (typeof window === "undefined" || !window.ethereum) return () => {};

  const handler = (...args: unknown[]) => {
    const accounts = args[0] as string[];
    cb(accounts[0] ?? null);
  };

  window.ethereum.on("accountsChanged", handler);
  return () => window.ethereum?.removeListener("accountsChanged", handler);
}

export function onChainChanged(cb: () => void): () => void {
  if (typeof window === "undefined" || !window.ethereum) return () => {};
  window.ethereum.on("chainChanged", cb);
  return () => window.ethereum?.removeListener("chainChanged", cb);
}
