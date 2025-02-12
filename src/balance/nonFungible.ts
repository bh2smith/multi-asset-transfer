import { NFTBalance, NFTBalanceEntry } from "./types";
import { safeTxServiceUrlFor } from "./safeUtil";

const COLLECTIBLE_MAX_PAGES = 10;

export async function getCollectibleBalance(
  chainId: number,
  safeAddress: string,
): Promise<NFTBalanceEntry[]> {
  let pageIndex = 0;
  let allCollectibles: NFTBalanceEntry[] = [];
  let nextUrl: string | null = await getCollectiblesURL(
    chainId,
    safeAddress,
    pageIndex,
  );

  while (nextUrl && pageIndex < COLLECTIBLE_MAX_PAGES) {
    try {
      const nftBalance: NFTBalance = await fetchCollectibles(nextUrl);
      allCollectibles = allCollectibles.concat(nftBalance.results);
      nextUrl = nftBalance.next; // Update next page URL
      pageIndex++;
    } catch (error) {
      console.error(`Failed to fetch collectibles: ${error}`);
      break;
    }
  }

  return allCollectibles;
}

async function fetchCollectibles(url: string): Promise<NFTBalance> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error fetching collectibles");
  }
  return response.json() as Promise<NFTBalance>;
}

function getCollectiblesURL(
  chainId: number,
  safeAddress: string,
  pageIndex: number,
  previousPageData?: NFTBalance,
): string | null {
  if (pageIndex === 0) {
    return `${safeTxServiceUrlFor(chainId)}/api/v2/safes/${safeAddress}/collectibles?trusted=true&exclude_spam=true&limit=10`;
  }
  if (previousPageData && !previousPageData.next) return null;
  return previousPageData?.next || null; // Next page URL
}
