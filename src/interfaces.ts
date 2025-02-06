import type {
  CollectibleTokenInfo,
  CollectibleTokenMetaInfo,
  MinimalTokenInfo,
} from "./types";

export interface TokenInfoProvider {
  getTokenInfo: (tokenAddress: string) => Promise<MinimalTokenInfo | undefined>;
  getNativeTokenSymbol: () => string;
  getSelectedNetworkShortname: () => Promise<string | undefined>;
}

export interface CollectibleTokenInfoProvider {
  getTokenInfo: (
    tokenAddress: string,
    id: string,
  ) => Promise<CollectibleTokenInfo | undefined>;
  getFromAddress: () => string;
  fetchMetaInfo: (
    tokenAddress: string,
    id: string,
    token_type: "erc1155" | "erc721",
  ) => Promise<CollectibleTokenMetaInfo>;
}

export interface EnsResolver {
  /**
   * Resolves a ENS name to a corresponding address.
   * Important: If the name is already a valid address, this address will be returned.
   *
   * @returns null if the ENS name cannot be resolved.
   *
   * @param ensName ENS Name or address.
   */
  resolveName(ensName: string): Promise<string | null>;

  /**
   * Looks up the ENS name of an address.
   *
   * @returns null if no ENS name is registered for that address.
   * @param address address to lookup
   */
  lookupAddress(address: string): Promise<string | null>;

  /**
   * @returns true, if ENS is enabled for current network.
   */
  isEnsEnabled(): Promise<boolean>;
}
