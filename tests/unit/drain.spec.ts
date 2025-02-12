import {
  drainSafe,
  getCollectibleBalance,
  getFungibleBalance,
} from "../../src";
import { AssetBalance, AssetBalanceEntry } from "../../src/balance/types";

describe("Default Providers:", () => {
  // const chainId = 137;
  const safeAddress = "0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA";
  describe("DefaultTokenInfoProvider", () => {
    it("constructor", async () => {
      // const ft = await getFungibleBalance(chainId, safeAddress);
      const ft = [
        {
          tokenAddress: null,
          token: null,
          balance: "337339669709699999",
        },
        {
          tokenAddress: "0x0000000000000000000000000000000000001010",
          token: {
            name: "Matic Token",
            symbol: "MATIC",
            decimals: 18,
            logoUri:
              "https://assets.coingecko.com/coins/images/32440/thumb/polygon.png?1698233684",
          },
          balance: "337339669709699999",
        },
        {
          tokenAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
          token: {
            name: "(PoS) Tether USD",
            symbol: "USDT",
            decimals: 6,
            logoUri:
              "https://assets.coingecko.com/coins/images/35023/thumb/USDT.png?1707233644",
          },
          balance: "10000",
        },
        {
          tokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
          token: {
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            logoUri:
              "https://assets.coingecko.com/coins/images/6319/thumb/usdc.png?1696506694",
          },
          balance: "124928",
        },
      ];
      // const nft = await getCollectibleBalance(chainId, safeAddress);
      const nft = [];

      const csv = drainSafe(safeAddress, { ft, nft });

      expect(csv).toBe(`token_type,token_address,receiver,amount,id
native,,0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA,0.337339669709699999,
erc20,0x0000000000000000000000000000000000001010,0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA,0.337339669709699999,
erc20,0xc2132D05D31c914a87C6611C10748AEb04B58e8F,0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA,0.01,
erc20,0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359,0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA,0.124928,`);
    });
  });
});
