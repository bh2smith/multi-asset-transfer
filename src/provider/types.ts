export type MinimalTokenInfo = {
  decimals: number;
  address: string;
  symbol?: string;
  logoURI?: string;
};

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
