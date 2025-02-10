import { AssetTransfer, CollectibleTransfer } from "../csv";
import { AssetSummaryEntry, CollectibleSummaryEntry } from "./types";

type FungibleSummary = Map<string | null, AssetSummaryEntry>;

export function assetTransfersToSummary(
  transfers: AssetTransfer[],
): FungibleSummary {
  return transfers.reduce((previousValue, currentValue): FungibleSummary => {
    let tokenSummary = previousValue.get(currentValue.tokenAddress);
    if (typeof tokenSummary === "undefined") {
      tokenSummary = {
        tokenAddress: currentValue.tokenAddress,
        amount: "0",
        decimals: currentValue.decimals,
        symbol: currentValue.symbol,
      };
      previousValue.set(currentValue.tokenAddress, tokenSummary);
    }
    tokenSummary.amount = (
      Number(tokenSummary.amount) + Number(currentValue.amount)
    ).toString();

    return previousValue;
  }, new Map());
}

type CollectibleSummary = Map<string | null, CollectibleSummaryEntry>;

export function collectibleTransfersToSummary(
  transfers: CollectibleTransfer[],
): CollectibleSummary {
  return transfers.reduce((previousValue, currentValue): CollectibleSummary => {
    const entryKey = `${currentValue.tokenAddress}:${currentValue.tokenId}`;
    let tokenSummary = previousValue.get(entryKey);
    if (typeof tokenSummary === "undefined") {
      tokenSummary = {
        tokenAddress: currentValue.tokenAddress,
        count: 0,
        name: currentValue.tokenName,
        id: currentValue.tokenId,
      };
      previousValue.set(entryKey, tokenSummary);
    }
    tokenSummary.count = tokenSummary.count + 1;

    return previousValue;
  }, new Map());
}
