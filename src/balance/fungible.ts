import { AssetBalanceEntry } from "./types";
import { safeTxServiceUrlFor } from "./safeUtil";

export async function getFungibleBalance(
  chainId: number,
  safeAddress: string,
): Promise<AssetBalanceEntry[] | undefined> {
  const endpoint = `${safeTxServiceUrlFor(chainId)}/api/v1/safes/${safeAddress}/balances?trusted=false&exclude_spam=true`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Error fetching fungible balances");
  }

  return response.json() as Promise<AssetBalanceEntry[]>;
}
