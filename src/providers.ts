import { Network } from "near-ca";
import {
  CollectibleTokenInfoProvider,
  EnsResolver,
  TokenInfoProvider,
} from "./interfaces";
import {
  MinimalTokenInfo,
  CollectibleTokenInfo,
  CollectibleTokenMetaInfo,
} from "./types";
import { Address, erc20Abi, erc721Abi, getAddress } from "viem";

export class DefaultTokenInfoProvider implements TokenInfoProvider {
  private network: Network;

  constructor(chainId: number) {
    this.network = Network.fromChainId(chainId);
  }

  async getTokenInfo(
    tokenAddress: string,
  ): Promise<MinimalTokenInfo | undefined> {
    try {
      const address = getAddress(tokenAddress);
      const client = this.network.client;
      const [symbol, decimals] = await Promise.all([
        client.readContract({
          address,
          abi: erc20Abi,
          functionName: "symbol",
        }),
        client.readContract({
          address,
          abi: erc20Abi,
          functionName: "decimals",
        }),
      ]);

      return { address: tokenAddress, symbol: symbol || "Undefined", decimals };
    } catch (error) {
      console.error(`Failed to fetch token info for ${tokenAddress}:`, error);
      return undefined;
    }
  }

  getNativeTokenSymbol(): string {
    return this.network.nativeCurrency.symbol;
  }

  getSelectedNetworkShortname(): string | undefined {
    // TODO: This might not be the expected format (may need safe shortnames)
    return this.network.name;
  }
}

export class DefaultCollectibleTokenInfoProvider
  implements CollectibleTokenInfoProvider
{
  private network: Network;

  constructor(chainId: number) {
    this.network = Network.fromChainId(chainId);
  }

  async getTokenInfo(
    tokenAddress: string,
    id: string,
  ): Promise<CollectibleTokenInfo | undefined> {
    try {
      const address = getAddress(tokenAddress);
      // Assume ERC-721 by default; check balanceOf to determine if it's owned
      const isERC721 = await this.network.client
        .readContract({
          address,
          abi: erc721Abi,
          functionName: "ownerOf",
          args: [BigInt(id)],
        })
        .then(() => true)
        .catch(() => false);

      return {
        token_type: isERC721 ? "erc721" : "erc1155",
        address: tokenAddress,
      };
    } catch (error) {
      console.error(
        `Failed to fetch collectible token info for ${tokenAddress} ID ${id}:`,
        error,
      );
      return undefined;
    }
  }

  getFromAddress(): string {
    throw new Error("Method not implemented.");
  }

  async fetchMetaInfo(
    tokenAddress: string,
    id: string,
    token_type: "erc1155" | "erc721",
  ): Promise<CollectibleTokenMetaInfo> {
    try {
      const uriMethod = token_type === "erc721" ? "tokenURI" : "uri";

      const tokenURI: string = await this.network.client.readContract({
        address: tokenAddress as Address,
        abi: [
          {
            type: "function",
            name: uriMethod,
            stateMutability: "view",
            inputs: [{ type: "uint256" }],
            outputs: [{ type: "string" }],
          },
        ],
        functionName: uriMethod,
        args: [BigInt(id)],
      });

      // Fetch metadata from the URI (assuming JSON metadata)
      const response = await fetch(
        tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"),
      );
      // TODO: Improve typing here (i.e. add type guard)
      const metadata = (await response.json()) as {
        image?: string;
        name?: string;
      };

      return { imageURI: metadata.image, name: metadata.name };
    } catch (error) {
      console.error(
        `Failed to fetch metadata for ${tokenAddress} ID ${id}:`,
        error,
      );
      return {};
    }
  }
}

export class DefaultEnsResolver implements EnsResolver {
  private network: Network;

  constructor() {
    this.network = Network.fromChainId(1);
  }

  async resolveName(ensName: string): Promise<string | null> {
    if (ensName.endsWith(".eth")) {
      try {
        const resolvedAddress = await this.network.client.getEnsAddress({
          name: ensName,
        });
        return resolvedAddress || null;
      } catch (error) {
        console.error(`Failed to resolve ENS name: ${ensName}`, error);
        return null;
      }
    }
    return ensName; // Already a valid address
  }

  async lookupAddress(address: string): Promise<string | null> {
    try {
      return (
        (await this.network.client.getEnsName({
          address: address as Address,
        })) || null
      );
    } catch (error) {
      console.error(`Failed to lookup ENS name for address: ${address}`, error);
      return null;
    }
  }

  async isEnsEnabled(): Promise<boolean> {
    try {
      return (
        (await this.network.client.getEnsAddress({ name: "vitalik.eth" })) !==
        null
      );
    } catch {
      return false;
    }
  }
}

// // Example usage:
// const tokenProvider = new DefaultTokenInfoProvider("mainnet");
// const collectibleProvider = new DefaultCollectibleTokenInfoProvider("0xYourAddress");
// const ensResolver = new DefaultEnsResolver();

// export { tokenProvider, collectibleProvider, ensResolver };
