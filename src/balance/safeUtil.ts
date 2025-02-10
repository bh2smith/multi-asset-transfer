// TODO(bh2smith) Load dynamically (safe SDK?)
const SAFE_NETWORKS: { [chainId: number]: string } = {
  1: "mainnet",
  10: "optimism",
  56: "binance",
  100: "gnosis-chain",
  137: "polygon",
  324: "zksync",
  1101: "zkevm",
  8453: "base",
  42161: "arbitrum",
  42220: "celo",
  43114: "avalanche",
  73799: "volta",
  11155111: "sepolia",
};

export function safeTxServiceUrlFor(chainId: number): string | undefined {
  const network = SAFE_NETWORKS[chainId];
  if (!network) {
    console.warn(`Unsupported Safe Transaction Service chainId=${chainId}`);
    return undefined;
  }
  return `https://safe-transaction-${network}.safe.global`;
}
