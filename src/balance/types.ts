type Token = {
  name: string;
  symbol: string;
  decimals: number;
};

export type AssetBalanceEntry = {
  tokenAddress: string | null;
  token: Token | null;
  balance: string;
  decimals: number;
};

export type NFTBalanceEntry = {
  address: string;
  tokenName: string;
  tokenSymbol: string;
  id: string;
  imageUri: string;
  name: string;
};

export type AssetBalance = AssetBalanceEntry[];

export type AssetSummaryEntry = {
  tokenAddress: string | null;
  amount: string;
  decimals: number;
  symbol?: string;
};

export type CollectibleSummaryEntry = {
  tokenAddress: string;
  id: string;
  count: number;
  name?: string;
};

export type NFTBalance = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NFTBalanceEntry[];
};
