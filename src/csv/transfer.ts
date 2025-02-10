import {
  encodeFunctionData,
  erc20Abi,
  erc721Abi,
  getAddress,
  parseAbi,
  parseUnits,
} from "viem";

export type Transfer = AssetTransfer | CollectibleTransfer;
export type AssetTokenType = "erc20" | "native";
export type CollectibleTokenType = "erc721" | "erc1155";

export type AssetTransfer = {
  token_type: AssetTokenType;
  receiver: string;
  amount: string;
  tokenAddress: string | null;
  decimals: number;
  symbol?: string;
  receiverEnsName: string | null;
  position?: number;
};

export type CollectibleTransfer = {
  token_type: CollectibleTokenType;
  from: string;
  receiver: string;
  tokenAddress: string;
  tokenId: string;
  tokenName?: string;
  amount?: string;
  receiverEnsName: string | null;
};

export type UnknownTransfer = {
  token_type: "unknown";
};

// TODO: import from somewhere (safesdk?)
export type BaseTransaction = {
  to: string;
  value: string;
  data: string;
};

export function buildMetaTransactions(
  transfers: Transfer[],
): BaseTransaction[] {
  return transfers.map((transfer) => {
    if (["native", "erc20"].includes(transfer.token_type)) {
      return buildAssetTransfer(transfer as AssetTransfer);
    } else if (["erc721", "erc1155"].includes(transfer.token_type)) {
      return buildCollectibleTransfer(transfer as CollectibleTransfer);
    } else {
      throw new Error(`Unsupported token type: ${transfer.token_type}`);
    }
  });
}

export function buildAssetTransfer(transfer: AssetTransfer): BaseTransaction {
  if (transfer.tokenAddress === null) {
    // Native asset transfer
    return {
      to: transfer.receiver,
      value: parseUnits(transfer.amount, 18).toString(),
      data: "0x",
    };
  } else {
    // ERC20 transfer
    return {
      to: transfer.tokenAddress,
      value: "0",
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [
          getAddress(transfer.receiver),
          parseUnits(transfer.amount, transfer.decimals),
        ],
      }),
    };
  }
}

export function buildCollectibleTransfer(
  transfer: CollectibleTransfer,
): BaseTransaction {
  const { from, receiver, tokenId, amount, tokenAddress } = transfer;
  if (transfer.token_type === "erc721") {
    return {
      to: tokenAddress,
      value: "0x00",
      data: encodeFunctionData({
        abi: erc721Abi,
        functionName: "safeTransferFrom",
        args: [getAddress(from), getAddress(receiver), BigInt(tokenId)],
      }),
    };
  } else {
    return {
      to: tokenAddress,
      value: "0x00",
      data: encodeFunctionData({
        abi: parseAbi([
          "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
        ]),
        functionName: "safeTransferFrom",
        args: [
          getAddress(from),
          getAddress(receiver),
          BigInt(tokenId),
          BigInt(amount ?? "0"),
          "0x00",
        ],
      }),
    };
  }
}
