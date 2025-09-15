import {
  Address,
  erc20Abi,
  erc721Abi,
  getAddress,
  PublicClient,
  zeroAddress,
} from "viem";
import { normalize } from "viem/ens";
import {
  CollectibleTokenInfoProvider,
  EnsResolver,
  TokenInfoProvider,
} from "./interface";
import {
  CollectibleTokenInfo,
  CollectibleTokenMetaInfo,
  MinimalTokenInfo,
} from "./types";
import { getClientForChain } from "./util";

export class DefaultTokenInfoProvider implements TokenInfoProvider {
  private client: PublicClient;

  constructor(chainId: number) {
    this.client = getClientForChain(chainId);
  }

  async getTokenInfo(
    tokenAddress: string,
  ): Promise<MinimalTokenInfo | undefined> {
    try {
      const address = getAddress(tokenAddress);
      const client = this.client;
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
    return this.client.chain!.nativeCurrency.symbol;
  }

  async getSelectedNetworkShortname(): Promise<string | undefined> {
    const response = await fetch(
      `https://raw.githubusercontent.com/ethereum-lists/chains/master/_data/chains/eip155-${this.client.chain?.id}.json`,
    );

    if (!response.ok) {
      console.error(`Failed to fetch chain data: ${response.statusText}`);
      return undefined;
    }

    const data = (await response.json()) as { shortName?: string };

    if (!data.shortName) {
      console.error(
        `Failed to retrieve chain shortName for ${this.client.chain?.id}`,
      );
      return undefined;
    }

    return data.shortName;
  }
}

export class DefaultCollectibleTokenInfoProvider
  implements CollectibleTokenInfoProvider
{
  private client: PublicClient;

  constructor(chainId: number) {
    this.client = getClientForChain(chainId);
  }

  async getTokenInfo(
    tokenAddress: string,
    id: string,
  ): Promise<CollectibleTokenInfo | undefined> {
    try {
      const address = getAddress(tokenAddress);
      // Assume ERC-721 by default; check balanceOf to determine if it's owned
      const isERC721 = await this.client
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
    // TODO(maybe): make it possible to pass something here
    // throw new Error("getFromAddress not implemented.");
    return zeroAddress;
  }

  async fetchMetaInfo(
    tokenAddress: string,
    id: string,
    token_type: "erc1155" | "erc721",
  ): Promise<CollectibleTokenMetaInfo> {
    try {
      const uriMethod = token_type === "erc721" ? "tokenURI" : "uri";

      const tokenURI: string = await this.client.readContract({
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
  private client: PublicClient;
  constructor() {
    this.client = getClientForChain(1);
  }

  async resolveName(ensName: string): Promise<string | null> {
    if (ensName.endsWith(".eth")) {
      try {
        const name = normalize(ensName);
        const resolvedAddress = await this.client.getEnsAddress({ name });
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
        (await this.client.getEnsName({ address: getAddress(address) })) || null
      );
    } catch (error) {
      console.error(`Failed to lookup ENS name for address: ${address}`, error);
      return null;
    }
  }

  async isEnsEnabled(): Promise<boolean> {
    try {
      const vitalik = await this.client.getEnsAddress({
        name: normalize("vitalik.eth"),
      });
      return vitalik !== null;
    } catch (error: unknown) {
      return false;
    }
  }
}

// // Example usage:
// const tokenProvider = new DefaultTokenInfoProvider("mainnet");
// const collectibleProvider = new DefaultCollectibleTokenInfoProvider("0xYourAddress");
// const ensResolver = new DefaultEnsResolver();

// export { tokenProvider, collectibleProvider, ensResolver };
