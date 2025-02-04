import { isAddress } from "viem";
import type {
  AssetTransfer,
  CodeWarning,
  CollectibleTransfer,
  Transfer,
  UnknownTransfer,
} from "./types";

enum HEADER_FIELDS {
  TYPE = "token_type",
  TOKEN_ADDRESS = "token_address",
  RECEIVER = "receiver",
  VALUE = "value",
  AMOUNT = "amount",
  ID = "id",
}

export function validateHeaders(fields: string[] | undefined): CodeWarning[] {
  const unknownFields = fields?.filter(
    (field) => !Object.values<string>(HEADER_FIELDS).includes(field),
  );

  if (unknownFields && unknownFields.length > 0) {
    return [
      {
        lineNum: 0,
        message: `Unknown header field(s): ${unknownFields.join(", ")}`,
        severity: "error",
      },
    ];
  }
  return [];
}

export const validateRow = (row: Transfer | UnknownTransfer): string[] => {
  // console.log("Validate Row", row);
  switch (row.token_type) {
    case "erc20":
    case "native":
      return validateAssetRow(row);
    case "erc1155":
    case "erc721":
      return validateCollectibleRow(row);
    default:
      return ["Unknown token_type: Must be one of erc20, native or nft"];
  }
};

/**
 * Validates, that addresses are valid, the amount is big enough and a decimal is given or can be found in token lists.
 */
export const validateAssetRow = (row: AssetTransfer) => {
  const warnings = [
    ...areAddressesValid(row),
    ...isAmountPositive(row),
    ...isAssetTokenValid(row),
  ];
  // console.log("Validate Asset Row", row, warnings);
  return warnings;
};

export const validateCollectibleRow = (row: CollectibleTransfer) => {
  const warnings = [
    ...areAddressesValid(row),
    ...isTokenIdInteger(row),
    ...isTokenIdNonNegative(row),
    ...isCollectibleTokenValid(row),
    ...isTokenValuePositiveInteger(row),
  ];
  // console.log("Validate Collectible Row", row, warnings);
  return warnings;
};

const areAddressesValid = (row: Transfer): string[] => {
  const warnings: string[] = [];
  if (!(row.tokenAddress === null || isAddress(row.tokenAddress))) {
    warnings.push(`Invalid Token Address: ${row.tokenAddress}`);
  }
  if (row.receiver.includes(":")) {
    warnings.push(
      `The chain prefix must match the current network: ${row.receiver}`,
    );
  } else {
    if (!isAddress(row.receiver)) {
      warnings.push(`Invalid Receiver Address: ${row.receiver}`);
    }
  }
  return warnings;
};

const isAmountPositive = (row: AssetTransfer): string[] =>
  parseFloat(row.amount) > 0
    ? []
    : ["Only positive amounts/values possible: " + row.amount];

const isAssetTokenValid = (row: AssetTransfer): string[] =>
  row.decimals === -1 && row.symbol === "TOKEN_NOT_FOUND"
    ? [`No token contract was found at ${row.tokenAddress}`]
    : [];

const isCollectibleTokenValid = (row: CollectibleTransfer): string[] =>
  row.tokenName === "TOKEN_NOT_FOUND"
    ? [`No token contract was found at ${row.tokenAddress}`]
    : [];

const isTokenIdNonNegative = (row: CollectibleTransfer): string[] => {
  return parseFloat(row.tokenId) >= 0n
    ? []
    : [`Only positive Token IDs possible: '${row.tokenId}'`];
};

const isTokenIdInteger = (row: CollectibleTransfer): string[] => {
  return isInteger(row.tokenId)
    ? []
    : [`Token IDs must be integer numbers: '${row.tokenId}'`];
};

const isTokenValuePositiveInteger = (row: CollectibleTransfer): string[] => {
  if (row.token_type === "erc721") {
    return []; // ERC721 tokens don’t require an amount check
  }

  if (typeof row.amount !== "undefined") {
    try {
      return BigInt(row.amount) > 0n
        ? []
        : [`ERC1155 Tokens need a defined value > 0: ${row.amount}`];
    } catch {
      // Catching Failure to be an integer!
      return [`Value / amount of ERC1155 must be an integer: ${row.amount}`];
    }

    // Convert to BigInt and check if it's greater than 0
  }
  return [`ERC1155 Tokens need a defined value > 0: ${row.amount}`];
};

const isInteger = (str: string): boolean => {
  return /^-?\d+$/.test(str);
};
