import { TokenInfo } from "../../src/provider";
import {
  buildAssetTransfer,
  buildCollectibleTransfer,
  buildMetaTransactions,
  Transfer,
  AssetTransfer,
  CollectibleTransfer,
} from "../../src/csv";
import { formatUnits, parseUnits } from "viem";

const MAX_U256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
);

const unlistedERC20Token = {
  address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  decimals: 18,
  symbol: "UNL",
  name: "Unlisted",
  chainId: -1,
};

const dummyERC721Token = {
  token_type: "erc721",
  address: "0x5500000000000000000000000000000000000000",
};

const dummyERC1155Token = {
  token_type: "erc1155",
  address: "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656",
};

const addresses = {
  receiver1: "0x1000000000000000000000000000000000000000",
  receiver2: "0x2000000000000000000000000000000000000000",
  receiver3: "0x3000000000000000000000000000000000000000",
  dummyErc721Address: "0x5500000000000000000000000000000000000000",
  dummyErc1155Address: "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656",
};

export const testData = {
  unlistedERC20Token,
  addresses,
  dummyERC721Token,
  dummyERC1155Token,
};

const safeAddress = "0x0000000000000000000000000000000000005AFE";
const receiver = testData.addresses.receiver1;

describe("Build Transfers:", () => {
  const listedToken = {
    name: "Wrapped Ether",
    address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    symbol: "WETH",
    decimals: 18,
    chainId: 4,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc778417E063141139Fce010982780140Aa0cD5Ab/logo.png",
  };

  describe("Integers", () => {
    it("works with large integers on listed, unlisted and native asset transfers", () => {
      const largePayments: AssetTransfer[] = [
        // Listed ERC20
        {
          token_type: "erc20",
          receiver,
          amount: formatUnits(MAX_U256, 18),
          tokenAddress: listedToken.address,
          decimals: listedToken.decimals,
          symbol: "LIT",
          receiverEnsName: null,
        },
        // Unlisted ERC20
        {
          token_type: "erc20",
          receiver,
          amount: formatUnits(MAX_U256, testData.unlistedERC20Token.decimals),
          tokenAddress: testData.unlistedERC20Token.address,
          decimals: testData.unlistedERC20Token.decimals,
          symbol: "ULT",
          receiverEnsName: null,
        },
        // Native Asset
        {
          token_type: "native",
          receiver,
          amount: formatUnits(MAX_U256, 18),
          tokenAddress: null,
          decimals: 18,
          symbol: "ETH",
          receiverEnsName: null,
        },
      ];

      const [listedTransfer, unlistedTransfer, nativeTransfer] =
        largePayments.map(buildAssetTransfer);
      expect(listedTransfer.value).toEqual("0");
      expect(listedTransfer.to).toEqual(listedToken.address);
      expect(listedTransfer.data).toEqual(
        "0xa9059cbb0000000000000000000000001000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );

      expect(unlistedTransfer.value).toEqual("0");
      expect(unlistedTransfer.to).toEqual(testData.unlistedERC20Token.address);
      expect(unlistedTransfer.data).toEqual(
        "0xa9059cbb0000000000000000000000001000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );

      expect(nativeTransfer.value).toEqual(MAX_U256.toString());
      expect(nativeTransfer.to).toEqual(receiver);
      expect(nativeTransfer.data).toEqual("0x");
    });
  });

  describe("Decimals", () => {
    it("works with decimal payments on listed, unlisted and native transfers", () => {
      const tinyAmount = "0.0000001";
      const smallPayments: AssetTransfer[] = [
        // Listed ERC20
        {
          token_type: "erc20",
          receiver,
          amount: tinyAmount,
          tokenAddress: listedToken.address,
          decimals: listedToken.decimals,
          symbol: "LIT",
          receiverEnsName: null,
        },
        // Unlisted ERC20
        {
          token_type: "erc20",
          receiver,
          amount: tinyAmount,
          tokenAddress: testData.unlistedERC20Token.address,
          decimals: testData.unlistedERC20Token.decimals,
          symbol: "ULT",
          receiverEnsName: null,
        },
        // Native Asset
        {
          token_type: "native",
          receiver,
          amount: tinyAmount,
          tokenAddress: null,
          decimals: 18,
          symbol: "ETH",
          receiverEnsName: null,
        },
      ];

      const [listed, unlisted, native] = smallPayments.map(buildAssetTransfer);
      expect(listed.value).toEqual("0");
      expect(listed.to).toEqual(listedToken.address);
      expect(listed.data).toEqual(
        "0xa9059cbb0000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000174876e800",
      );

      expect(unlisted.value).toEqual("0");
      expect(unlisted.to).toEqual(testData.unlistedERC20Token.address);
      expect(unlisted.data).toEqual(
        "0xa9059cbb0000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000174876e800",
      );

      expect(native.value).toEqual(parseUnits(tinyAmount, 18).toString());
      expect(native.to).toEqual(receiver);
      expect(native.data).toEqual("0x");
    });
  });

  describe("Mixed", () => {
    it("works with arbitrary value strings on listed, unlisted and native transfers", () => {
      const mixedAmount = "123456.000000789";
      const mixedPayments: AssetTransfer[] = [
        // Listed ERC20
        {
          token_type: "erc20",
          receiver,
          amount: mixedAmount,
          tokenAddress: listedToken.address,
          decimals: listedToken.decimals,
          symbol: "LIT",
          receiverEnsName: null,
        },
        // Unlisted ERC20
        {
          token_type: "erc20",
          receiver,
          amount: mixedAmount,
          tokenAddress: testData.unlistedERC20Token.address,
          decimals: testData.unlistedERC20Token.decimals,
          symbol: "ULT",
          receiverEnsName: null,
        },
        // Native Asset
        {
          token_type: "native",
          receiver,
          amount: mixedAmount,
          tokenAddress: null,
          decimals: 18,
          symbol: "ETH",
          receiverEnsName: null,
        },
      ];

      const [listed, unlisted, native] = mixedPayments.map(buildAssetTransfer);
      expect(listed.value).toEqual("0");
      expect(listed.to).toEqual(listedToken.address);
      expect(listed.data).toEqual(
        "0xa9059cbb0000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000001a24902beecbd5109200",
      );

      expect(unlisted.value).toEqual("0");
      expect(unlisted.to).toEqual(testData.unlistedERC20Token.address);
      expect(unlisted.data).toEqual(
        "0xa9059cbb0000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000001a24902beecbd5109200",
      );

      expect(native.value).toEqual(parseUnits(mixedAmount, 18).toString());
      expect(native.to).toEqual(receiver);
      expect(native.data).toEqual("0x");
    });
  });

  describe("Truncation on too many decimals", () => {
    it("cuts fractional part of token with 0 decimals", () => {
      const amount = "1.000000789";
      const crappyToken: TokenInfo = {
        address: "0x6b175474e89094c44da98b954eedeac495271d0f",
        decimals: 0,
        symbol: "NOD",
        name: "No Decimals",
        chainId: -1,
      };

      const payment: AssetTransfer = {
        token_type: "erc20",
        receiver,
        amount: amount,
        tokenAddress: crappyToken.address,
        decimals: crappyToken.decimals,
        symbol: "BTC",
        receiverEnsName: null,
      };
      const transfer = buildAssetTransfer(payment);
      expect(transfer.value).toEqual("0");
      expect(transfer.to).toEqual(crappyToken.address);
      expect(transfer.data).toEqual(
        "0xa9059cbb00000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
      );
    });
  });

  describe("Collectibles", () => {
    it("correctly builds ERC721 and ERC1155 transfers", () => {
      const transfers: CollectibleTransfer[] = [
        {
          token_type: "erc721",
          receiver,
          from: safeAddress,
          receiverEnsName: null,
          tokenAddress: testData.addresses.dummyErc721Address,
          tokenName: "Test NFT",
          tokenId: "69",
        },
        {
          token_type: "erc1155",
          receiver,
          from: safeAddress,
          receiverEnsName: null,
          tokenAddress: testData.addresses.dummyErc1155Address,
          tokenName: "Test MultiToken",
          amount: "69",
          tokenId: "420",
        },
      ];

      const [firstTransfer, secondTransfer] = transfers.map(
        buildCollectibleTransfer,
      );

      expect(firstTransfer.value).toEqual("0x00");
      expect(firstTransfer.to).toEqual(testData.addresses.dummyErc721Address);
      expect(firstTransfer.data).toEqual(
        "0x42842e0e0000000000000000000000000000000000000000000000000000000000005afe00000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045",
      );

      expect(secondTransfer.value).toEqual("0x00");
      expect(secondTransfer.to).toEqual(testData.addresses.dummyErc1155Address);
      expect(secondTransfer.data).toEqual(
        "0xf242432a0000000000000000000000000000000000000000000000000000000000005afe000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
      );
    });
  });

  describe("buildMetaTransactions", () => {
    it("correctly builds processes arbitrary transfers", () => {
      const common = {
        receiverEnsName: null,
        receiver,
      };
      const transfers: Transfer[] = [
        {
          ...common,
          token_type: "erc20",
          amount: "1",
          tokenAddress: listedToken.address,
          decimals: listedToken.decimals,
          symbol: "LIT",
        },
        {
          ...common,
          token_type: "erc721",
          from: safeAddress,
          tokenAddress: testData.addresses.dummyErc721Address,
          tokenId: "69",
        },
        {
          ...common,
          token_type: "erc1155",
          from: safeAddress,
          tokenAddress: testData.addresses.dummyErc1155Address,
          amount: "69",
          tokenId: "420",
        },
      ];

      const txns = buildMetaTransactions(transfers);
      expect(txns).toStrictEqual([
        {
          to: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
          value: "0",
          data: "0xa9059cbb00000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000",
        },
        {
          to: "0x5500000000000000000000000000000000000000",
          value: "0x00",
          data: "0x42842e0e0000000000000000000000000000000000000000000000000000000000005afe00000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045",
        },
        {
          to: "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656",
          value: "0x00",
          data: "0xf242432a0000000000000000000000000000000000000000000000000000000000005afe000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
        },
      ]);
    });
  });
});
