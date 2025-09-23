import { HttpTransport, PublicClient, createPublicClient, http } from "viem";
import * as chains from "viem/chains";

type Chain = chains.Chain;

const CHAINS_BY_CHAIN_ID = Object.fromEntries(
  Object.values(chains).map((chain) => [chain.id, chain]),
);

const getChainById = (chainId: number): Chain | undefined => {
  return CHAINS_BY_CHAIN_ID[chainId];
};

export function getClientForChain(
  chainId: number,
  rpcUrl?: string,
): PublicClient<HttpTransport, Chain> {
  const chain = getChainById(chainId);
  if (!chain) {
    throw new Error(`Chain with ID ${chainId} not found`);
  }
  return createPublicClient({
    chain,
    transport: http(rpcUrl || chain.rpcUrls.default.http[0]),
  });
}
