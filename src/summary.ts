import {
  AssetSummaryEntry,
  AssetTransfer,
  CollectibleSummaryEntry,
  CollectibleTransfer,
} from "./types";

export const assetTransfersToSummary = (transfers: AssetTransfer[]) => {
  return transfers.reduce(
    (previousValue, currentValue): Map<string | null, AssetSummaryEntry> => {
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
    },
    new Map<string | null, AssetSummaryEntry>(),
  );
};

export const collectibleTransfersToSummary = (
  transfers: CollectibleTransfer[],
) => {
  return transfers.reduce(
    (
      previousValue,
      currentValue,
    ): Map<string | null, CollectibleSummaryEntry> => {
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
    },
    new Map<string | null, CollectibleSummaryEntry>(),
  );
};
