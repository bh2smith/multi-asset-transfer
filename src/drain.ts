import { Address, formatEther, formatUnits } from "viem";
import { AssetBalance, NFTBalanceEntry } from "./balance/types";

export function drainSafe(
  to: Address,
  balances: { ft: AssetBalance; nft: NFTBalanceEntry[] },
): string {
  let drainCSV = "token_type,token_address,receiver,amount,id";

  if (to) {
    balances.ft?.forEach((asset) => {
      const { tokenAddress, token, balance } = asset;
      if (asset.token === null && tokenAddress === null) {
        const decimalBalance = formatEther(BigInt(balance));
        // The API returns zero balances for the native token.
        if (parseFloat(decimalBalance) > 0) {
          drainCSV += `\nnative,,${to},${decimalBalance},`;
        }
      } else {
        if (token?.decimals) {
          const amount = formatUnits(BigInt(asset.balance), token.decimals);
          drainCSV += `\nerc20,${asset.tokenAddress},${to},${amount},`;
        }
      }
    });

    balances.nft.forEach(({ address, id }) => {
      drainCSV += `\nnft,${address},${to},,${id}`;
    });
  }
  return drainCSV;
}
