import { AssetBalanceEntry } from "./types";
import { safeTxServiceUrlFor } from "./safeUtil";

export async function getFungibleBalance(
  chainId: number,
  safeAddress: string,
  trusted: boolean = false,
  exclude_spam: boolean = true,
): Promise<AssetBalanceEntry[] | undefined> {
  const params = `trusted=${trusted}&exclude_spam=${exclude_spam}`;
  const endpoint = `${safeTxServiceUrlFor(chainId)}/api/v1/safes/${safeAddress}/balances?${params}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Error fetching fungible balances");
  }

  return response.json() as Promise<AssetBalanceEntry[]>;
}
