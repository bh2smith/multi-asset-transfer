import type {
  CollectibleTokenInfoProvider,
  EnsResolver,
  TokenInfoProvider,
} from "../provider";
import type { CSVRow } from "./common";
import type {
  Transfer,
  AssetTransfer,
  CollectibleTransfer,
  UnknownTransfer,
} from "./transfer";
import { getAddress, isAddress, zeroAddress } from "viem";

export async function transform(
  row: CSVRow,
  tokenInfoProvider: TokenInfoProvider,
  erc721InfoProvider: CollectibleTokenInfoProvider,
  ensResolver: EnsResolver,
): Promise<Transfer | UnknownTransfer> {
  const selectedChainShortname =
    await tokenInfoProvider.getSelectedNetworkShortname();

  const trimmedReceiver = trimMatchingNetwork(
    row.receiver,
    selectedChainShortname,
  );
  const receiver = trimmedReceiver;

  switch (row.token_type?.toLowerCase()) {
    case "erc20":
      return transformAsset(
        { ...row, token_type: "erc20", receiver },
        tokenInfoProvider,
        ensResolver,
      );
    case "native":
      return transformAsset(
        { ...row, token_type: "native", receiver },
        tokenInfoProvider,
        ensResolver,
      );
    case "nft":
    case "erc721":
    case "erc1155":
      return transformCollectible(
        { ...row, token_type: "nft", receiver },
        erc721InfoProvider,
        ensResolver,
      );
    default:
      // Fallback so people can still use the old csv file format
      return transformAsset(
        { ...row, token_type: "erc20", receiver },
        tokenInfoProvider,
        ensResolver,
      );
  }
}

async function transformAsset(
  row: Omit<CSVRow, "token_type"> & { token_type: "erc20" | "native" },
  tokenInfoProvider: TokenInfoProvider,
  ensResolver: EnsResolver,
): Promise<Transfer> {
  const selectedChainShortname =
    await tokenInfoProvider.getSelectedNetworkShortname();
  const prePayment: PrePayment = {
    // avoids errors from getAddress. Invalid addresses are later caught in validateRow
    tokenAddress: transformERC20TokenAddress(row.token_address),
    amount: row.amount ?? row.value ?? "",
    receiver: normalizeAddress(
      trimMatchingNetwork(row.receiver, selectedChainShortname),
    ),
    tokenType: row.token_type,
  };

  return toPayment(prePayment, tokenInfoProvider, ensResolver);
}

/**
 * Transforms each row into a payment object.
 */
const transformCollectible = (
  row: Omit<CSVRow, "token_type"> & { token_type: "nft" },
  erc721InfoProvider: CollectibleTokenInfoProvider,
  ensResolver: EnsResolver,
): Promise<Transfer> => {
  let amount = row.amount ?? row.value ?? "1";
  amount = amount === "" ? "1" : amount;
  const prePayment: PreCollectibleTransfer = {
    // avoids errors from getAddress. Invalid addresses are later caught in validateRow
    tokenAddress: normalizeAddress(row.token_address),
    tokenId: row.id ?? "",
    receiver: normalizeAddress(row.receiver),
    tokenType: row.token_type,
    amount,
  };

  return toCollectibleTransfer(prePayment, erc721InfoProvider, ensResolver);
};

const toPayment = async (
  row: PrePayment,
  tokenInfoProvider: TokenInfoProvider,
  ensResolver: EnsResolver,
): Promise<AssetTransfer> => {
  // depending on whether there is an ens name or an address provided we either resolve or lookup
  // For performance reasons the lookup will be done after the parsing.
  const [resolvedReceiverAddress, receiverEnsName] =
    await resolveReceiverAddress(row.receiver, ensResolver);
  if (row.tokenAddress === null) {
    // Native asset payment.
    return {
      receiver: resolvedReceiverAddress,
      amount: row.amount,
      tokenAddress: row.tokenAddress,
      decimals: 18,
      symbol: tokenInfoProvider.getNativeTokenSymbol(),
      receiverEnsName,
      token_type: "native",
    };
  }
  const resolvedTokenAddress = (await ensResolver.isEnsEnabled())
    ? await ensResolver.resolveName(row.tokenAddress).catch(() => null)
    : row.tokenAddress;
  const tokenInfo =
    resolvedTokenAddress === null
      ? undefined
      : await tokenInfoProvider.getTokenInfo(resolvedTokenAddress);
  if (typeof tokenInfo !== "undefined") {
    const decimals = tokenInfo.decimals;
    const symbol = tokenInfo.symbol;
    return {
      receiver:
        resolvedReceiverAddress !== null
          ? resolvedReceiverAddress
          : row.receiver,
      amount: row.amount,
      tokenAddress: resolvedTokenAddress,
      decimals,
      symbol,
      receiverEnsName,
      token_type: "erc20",
    };
  } else {
    return {
      receiver:
        resolvedReceiverAddress !== null
          ? resolvedReceiverAddress
          : row.receiver,
      amount: row.amount,
      tokenAddress: row.tokenAddress,
      decimals: -1,
      symbol: "TOKEN_NOT_FOUND",
      receiverEnsName,
      token_type: "erc20",
    };
  }
};

const toCollectibleTransfer = async (
  preCollectible: PreCollectibleTransfer,
  collectibleTokenInfoProvider: CollectibleTokenInfoProvider,
  ensResolver: EnsResolver,
): Promise<CollectibleTransfer> => {
  let fromAddress: string = zeroAddress;
  try {
    // safe-airdrop uses mounted safe.safeAddress.
    fromAddress = collectibleTokenInfoProvider.getFromAddress();
  } catch {
    // If safe not mounted. Fetch token Owner or just keep zeroAddress.
  }

  const [resolvedReceiverAddress, receiverEnsName] =
    await resolveReceiverAddress(preCollectible.receiver, ensResolver);

  const tokenInfo = await collectibleTokenInfoProvider.getTokenInfo(
    preCollectible.tokenAddress,
    preCollectible.tokenId,
  );

  if (tokenInfo?.token_type === "erc721") {
    return {
      from: fromAddress,
      receiver:
        resolvedReceiverAddress !== null
          ? resolvedReceiverAddress
          : preCollectible.receiver,
      tokenId: preCollectible.tokenId,
      tokenAddress: preCollectible.tokenAddress,
      receiverEnsName,
      token_type: "erc721",
    };
  } else if (tokenInfo?.token_type === "erc1155") {
    return {
      from: fromAddress,
      receiver:
        resolvedReceiverAddress !== null
          ? resolvedReceiverAddress
          : preCollectible.receiver,
      tokenId: preCollectible.tokenId,
      tokenAddress: preCollectible.tokenAddress,
      receiverEnsName,
      amount: preCollectible.amount,
      token_type: "erc1155",
    };
  } else {
    // return a fake token which will fail validation.
    return {
      from: fromAddress,
      receiver:
        resolvedReceiverAddress !== null
          ? resolvedReceiverAddress
          : preCollectible.receiver,
      tokenId: preCollectible.tokenId,
      tokenAddress: preCollectible.tokenAddress,
      tokenName: "TOKEN_NOT_FOUND",
      receiverEnsName,
      token_type: "erc721",
    };
  }
};

/**
 * returns null if the tokenAddress is empty.
 * Parses and normalizes tokenAddress into a checksum address if the tokenAddress is provided
 */
const transformERC20TokenAddress = (tokenAddress: string | null) =>
  tokenAddress === "" || tokenAddress === null
    ? null
    : normalizeAddress(tokenAddress);

// Local Utility functions.
async function resolveReceiverAddress(
  receiver: string,
  ensResolver: EnsResolver,
): Promise<[string, string | null]> {
  if (isAddress(receiver)) {
    return [receiver, null];
  }

  const resolvedAddress = (await ensResolver.isEnsEnabled())
    ? await ensResolver.resolveName(receiver).catch(() => null)
    : null;

  return [resolvedAddress !== null ? resolvedAddress : receiver, receiver];
}

const trimMatchingNetwork = (address: string, selectedPrefix?: string) => {
  if (
    selectedPrefix &&
    address &&
    address.trim().startsWith(`${selectedPrefix}:`)
  ) {
    return address.slice(address.indexOf(":") + 1);
  } else {
    return address;
  }
};

/*
 *  Parses and normalizes tokenAddress
 */
const normalizeAddress = (address: string) =>
  isAddress(address) ? getAddress(address) : address;

type PreCollectibleTransfer = {
  receiver: string;
  tokenId: string;
  tokenAddress: string;
  tokenType: "nft";
  amount?: string;
};

type PrePayment = {
  receiver: string;
  amount: string;
  tokenAddress: string | null;
  tokenType: "erc20" | "native";
};
