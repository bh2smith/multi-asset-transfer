export type CollectibleTokenInfo = {
  token_type: "erc721" | "erc1155";
  address: string;
};

export type CollectibleTokenMetaInfo = {
  imageURI?: string;
  name?: string;
};

export interface TokenInfo {
  readonly chainId: number;
  readonly address: string;
  readonly name: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: {
    readonly [key: string]: string | number | boolean | null;
  };
}

export type TokenMap = Map<string | null, MinimalTokenInfo>;

export type MinimalTokenInfo = {
  decimals: number;
  address: string;
  symbol?: string;
  logoURI?: string;
};

export type PrePayment = {
  receiver: string;
  amount: string;
  tokenAddress: string | null;
  tokenType: "erc20" | "native";
};

export type PreCollectibleTransfer = {
  receiver: string;
  tokenId: string;
  tokenAddress: string;
  tokenType: "nft";
  amount?: string;
};

export type CodeWarning = {
  message: string;
  severity: string;
  lineNum: number;
};

export type Message = {
  message: string;
  severity: "success" | "error" | "warning";
};

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
  tokenName?: string;
  tokenId: string;
  amount?: string;
  receiverEnsName: string | null;
};

export type UnknownTransfer = {
  token_type: "unknown";
};

export type CSVRow = {
  token_type?: string;
  token_address: string;
  receiver: string;
  value?: string;
  amount?: string;
  id?: string;
};
