import { parseUnits } from "viem";
import {
  assetTransfersToSummary,
  collectibleTransfersToSummary,
} from "./summary";
import {
  AssetBalanceEntry,
  AssetTransfer,
  CollectibleTransfer,
  NFTBalanceEntry,
  Transfer,
} from "./types";

export type InsufficientBalanceInfo = {
  token: string;
  transferAmount?: string;
  isDuplicate: boolean;
  token_type: "erc20" | "native" | "erc721";
  id?: string;
};

export function checkAllBalances(
  assetBalance: AssetBalanceEntry[] | undefined,
  collectibleBalance: NFTBalanceEntry[] | undefined,
  transfers: Transfer[],
): InsufficientBalanceInfo[] {
  const insufficientTokens: InsufficientBalanceInfo[] = [];

  const assetSummary = assetTransfersToSummary(
    transfers.filter(
      (transfer) =>
        transfer.token_type === "erc20" || transfer.token_type === "native",
    ) as AssetTransfer[],
  );

  // erc1155 balance checks are not possible yet through the safe api
  const collectibleSummary = collectibleTransfersToSummary(
    transfers.filter(
      (transfer) => transfer.token_type === "erc721",
    ) as CollectibleTransfer[],
  );

  for (const {
    tokenAddress,
    amount,
    decimals,
    symbol,
  } of assetSummary.values()) {
    if (tokenAddress === null) {
      // Check ETH Balance
      const tokenBalance = assetBalance?.find(
        (balanceEntry) => balanceEntry.tokenAddress === null,
      );

      if (
        typeof tokenBalance === "undefined" ||
        !isSufficientBalance(BigInt(tokenBalance.balance), amount, 18)
      ) {
        insufficientTokens.push({
          token: tokenBalance?.token?.symbol || "ETH",
          token_type: "native",
          transferAmount: amount,
          isDuplicate: false, // For Erc20 / Coin Transfers duplicates are never an issue
        });
      }
    } else {
      const tokenBalance = assetBalance?.find(
        (balanceEntry) =>
          balanceEntry.tokenAddress?.toLowerCase() ===
          tokenAddress.toLowerCase(),
      );
      if (
        typeof tokenBalance === "undefined" ||
        !isSufficientBalance(BigInt(tokenBalance.balance), amount, decimals)
      ) {
        insufficientTokens.push({
          token: symbol || tokenAddress,
          token_type: "erc20",
          transferAmount: amount,
          isDuplicate: false, // For Erc20 / Coin Transfers duplicates are never an issue
        });
      }
    }
  }

  for (const { tokenAddress, count, name, id } of collectibleSummary.values()) {
    const tokenBalance = collectibleBalance?.find(
      (balanceEntry) =>
        balanceEntry.address?.toLowerCase() === tokenAddress.toLowerCase() &&
        balanceEntry.id === id,
    );
    if (typeof tokenBalance === "undefined" || count > 1) {
      const tokenName =
        name ??
        tokenBalance?.tokenName ??
        collectibleBalance?.find(
          (balanceEntry) =>
            balanceEntry.address?.toLowerCase() === tokenAddress.toLowerCase(),
        )?.tokenName;
      insufficientTokens.push({
        token: tokenName ?? tokenAddress,
        token_type: "erc721",
        isDuplicate: count > 1,
        id: id,
      });
    }
  }

  return insufficientTokens;
}

const isSufficientBalance = (
  tokenBalance: bigint,
  transferAmount: string,
  decimals: number,
) => {
  return BigInt(tokenBalance) >= parseUnits(transferAmount, decimals);
};
