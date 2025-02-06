import { parseUnits } from "viem";
import {
  AssetTransfer,
  assetTransfersToSummary,
  checkAllBalances,
  CollectibleTransfer,
} from "../src";

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

describe("transferToSummary and check balances", () => {
  it("works for integer native currency", () => {
    const transfers: AssetTransfer[] = [
      {
        token_type: "native",
        tokenAddress: null,
        amount: "1",
        receiver: testData.addresses.receiver1,
        decimals: 18,
        symbol: "ETH",
        receiverEnsName: null,
      },
      {
        token_type: "native",
        tokenAddress: null,
        amount: "2",
        receiver: testData.addresses.receiver2,
        decimals: 18,
        symbol: "ETH",
        receiverEnsName: null,
      },
      {
        token_type: "native",
        tokenAddress: null,
        amount: "3",
        receiver: testData.addresses.receiver3,
        decimals: 18,
        symbol: "ETH",
        receiverEnsName: null,
      },
    ];
    const summary = assetTransfersToSummary(transfers);
    expect(summary.get(null)?.amount.toString()).toEqual("6");

    const exactBalance = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("6", 18).toString(),
        decimals: 18,
      },
    ];
    const biggerBalance = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("7", 18).toString(),
        decimals: 18,
      },
    ];
    const smallerBalance = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("5.999999999999", 18).toString(),
        decimals: 18,
      },
    ];

    expect(checkAllBalances(exactBalance, undefined, transfers)).toHaveLength(
      0,
    );
    expect(checkAllBalances(biggerBalance, undefined, transfers)).toHaveLength(
      0,
    );
    const smallBalanceCheckResult = checkAllBalances(
      smallerBalance,
      undefined,
      transfers,
    );
    expect(smallBalanceCheckResult).toHaveLength(1);
    expect(smallBalanceCheckResult[0].token).toEqual("ETH");
    expect(smallBalanceCheckResult[0].token_type).toEqual("native");
    expect(smallBalanceCheckResult[0].transferAmount).toEqual("6");
  });

  it("works for decimals in native currency", () => {
    const transfers: AssetTransfer[] = [
      {
        token_type: "native",
        tokenAddress: null,
        amount: "0.1",
        receiver: testData.addresses.receiver1,
        decimals: 18,
        symbol: "ETH",
        receiverEnsName: null,
      },
      {
        token_type: "native",
        tokenAddress: null,
        amount: "0.01",
        receiver: testData.addresses.receiver2,
        decimals: 18,
        symbol: "ETH",
        receiverEnsName: null,
      },
      {
        token_type: "native",
        tokenAddress: null,
        amount: "0.001",
        receiver: testData.addresses.receiver3,
        decimals: 18,
        symbol: "ETH",
        receiverEnsName: null,
      },
    ];
    const summary = assetTransfersToSummary(transfers);
    expect(summary.get(null)?.amount.toString()).toEqual("0.111");

    const exactBalance = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("0.111", 18).toString(),
        decimals: 18,
      },
    ];
    const biggerBalance = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("0.1111", 18).toString(),
        decimals: 18,
      },
    ];
    const smallerBalance = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("0.11", 18).toString(),
        decimals: 18,
      },
    ];

    expect(checkAllBalances(exactBalance, undefined, transfers)).toHaveLength(
      0,
    );
    expect(checkAllBalances(biggerBalance, undefined, transfers)).toHaveLength(
      0,
    );
    const smallBalanceCheckResult = checkAllBalances(
      smallerBalance,
      undefined,
      transfers,
    );
    expect(smallBalanceCheckResult).toHaveLength(1);
    expect(smallBalanceCheckResult[0].token).toEqual("ETH");
    expect(smallBalanceCheckResult[0].token_type).toEqual("native");
    expect(smallBalanceCheckResult[0].transferAmount).toEqual("0.111");
  });

  it("works for decimals in erc20", () => {
    const transfers: AssetTransfer[] = [
      {
        token_type: "erc20",
        tokenAddress: testData.unlistedERC20Token.address,
        amount: "0.1",
        receiver: testData.addresses.receiver1,
        decimals: 18,
        symbol: "ULT",
        receiverEnsName: null,
      },
      {
        token_type: "erc20",
        tokenAddress: testData.unlistedERC20Token.address,
        amount: "0.01",
        receiver: testData.addresses.receiver2,
        decimals: 18,
        symbol: "ULT",
        receiverEnsName: null,
      },
      {
        token_type: "erc20",
        tokenAddress: testData.unlistedERC20Token.address,
        amount: "0.001",
        receiver: testData.addresses.receiver3,
        decimals: 18,
        symbol: "ULT",
        receiverEnsName: null,
      },
    ];
    const summary = assetTransfersToSummary(transfers);
    expect(
      summary.get(testData.unlistedERC20Token.address)?.amount.toString(),
    ).toEqual("0.111");

    const exactBalance = [
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("0.111", 18).toString(),
        decimals: 18,
      },
    ];
    const biggerBalance = [
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("0.1111", 18).toString(),
        decimals: 18,
      },
    ];
    const smallerBalance = [
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("0.11", 18).toString(),
        decimals: 18,
      },
    ];

    expect(checkAllBalances(exactBalance, undefined, transfers)).toHaveLength(
      0,
    );
    expect(checkAllBalances(biggerBalance, undefined, transfers)).toHaveLength(
      0,
    );
    const smallBalanceCheckResult = checkAllBalances(
      smallerBalance,
      undefined,
      transfers,
    );
    expect(smallBalanceCheckResult).toHaveLength(1);
    expect(smallBalanceCheckResult[0].token).toEqual("ULT");
    expect(smallBalanceCheckResult[0].token_type).toEqual("erc20");
    expect(smallBalanceCheckResult[0].transferAmount).toEqual("0.111");
  });

  it("works for integer in erc20", () => {
    const transfers: AssetTransfer[] = [
      {
        token_type: "erc20",
        tokenAddress: testData.unlistedERC20Token.address,
        amount: "1",
        receiver: testData.addresses.receiver1,
        decimals: 18,
        symbol: "ULT",
        receiverEnsName: null,
      },
      {
        token_type: "erc20",
        tokenAddress: testData.unlistedERC20Token.address,
        amount: "2",
        receiver: testData.addresses.receiver2,
        decimals: 18,
        symbol: "ULT",
        receiverEnsName: null,
      },
      {
        token_type: "erc20",
        tokenAddress: testData.unlistedERC20Token.address,
        amount: "3",
        receiver: testData.addresses.receiver3,
        decimals: 18,
        symbol: "ULT",
        receiverEnsName: null,
      },
    ];
    const summary = assetTransfersToSummary(transfers);
    expect(
      summary.get(testData.unlistedERC20Token.address)?.amount.toString(),
    ).toEqual("6");

    const exactBalance = [
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("6", 18).toString(),
        decimals: 18,
      },
    ];
    const biggerBalance = [
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("7", 18).toString(),
        decimals: 18,
      },
    ];
    const smallerBalance = [
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("5.999999999999", 18).toString(),
        decimals: 18,
      },
    ];

    expect(checkAllBalances(exactBalance, undefined, transfers)).toHaveLength(
      0,
    );
    expect(checkAllBalances(biggerBalance, undefined, transfers)).toHaveLength(
      0,
    );
    const smallBalanceCheckResult = checkAllBalances(
      smallerBalance,
      undefined,
      transfers,
    );
    expect(smallBalanceCheckResult).toHaveLength(1);
    expect(smallBalanceCheckResult[0].token).toEqual("ULT");
    expect(smallBalanceCheckResult[0].token_type).toEqual("erc20");
    expect(smallBalanceCheckResult[0].transferAmount).toEqual("6");
  });

  it("works for mixed payments", () => {
    const transfers: AssetTransfer[] = [
      {
        token_type: "erc20",
        tokenAddress: testData.unlistedERC20Token.address,
        amount: "1.1",
        receiver: testData.addresses.receiver1,
        decimals: 18,
        symbol: "ULT",
        receiverEnsName: null,
      },
      {
        token_type: "erc20",
        tokenAddress: testData.unlistedERC20Token.address,
        amount: "2",
        receiver: testData.addresses.receiver2,
        decimals: 18,
        symbol: "ULT",
        receiverEnsName: null,
      },
      {
        token_type: "erc20",
        tokenAddress: testData.unlistedERC20Token.address,
        amount: "3.3",
        receiver: testData.addresses.receiver3,
        decimals: 18,
        symbol: "ULT",
        receiverEnsName: null,
      },
      {
        token_type: "native",
        tokenAddress: null,
        amount: "3",
        receiver: testData.addresses.receiver1,
        decimals: 18,
        symbol: "ETH",
        receiverEnsName: null,
      },
      {
        token_type: "native",
        tokenAddress: null,
        amount: "0.33",
        receiver: testData.addresses.receiver1,
        decimals: 18,
        symbol: "ETH",
        receiverEnsName: null,
      },
    ];
    const summary = assetTransfersToSummary(transfers);
    expect(
      summary.get(testData.unlistedERC20Token.address)?.amount.toString(),
    ).toEqual("6.4");
    expect(summary.get(null)?.amount.toString()).toEqual("3.33");

    const exactBalance = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("3.33", 18).toString(),
        decimals: 18,
      },
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("6.4", 18).toString(),
        decimals: 18,
      },
    ];
    const biggerBalance = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("3.34", 18).toString(),
        decimals: 18,
      },
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("6.5", 18).toString(),
        decimals: 18,
      },
    ];
    const smallerBalance = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("3.32", 18).toString(),
        decimals: 18,
      },
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("6.3", 18).toString(),
        decimals: 18,
      },
    ];

    const lessNativeMoreErc20 = [
      {
        token: null,
        tokenAddress: null,
        balance: parseUnits("3.32", 18).toString(),
        decimals: 18,
      },
      {
        token: {
          decimals: 18,
          symbol: "ULT",
          name: "Unlisted Token",
        },
        tokenAddress: testData.unlistedERC20Token.address,
        balance: parseUnits("69", 18).toString(),
        decimals: 18,
      },
    ];

    expect(checkAllBalances(exactBalance, undefined, transfers)).toHaveLength(
      0,
    );
    expect(checkAllBalances(biggerBalance, undefined, transfers)).toHaveLength(
      0,
    );
    const smallBalanceCheckResult = checkAllBalances(
      smallerBalance,
      undefined,
      transfers,
    );
    expect(smallBalanceCheckResult).toHaveLength(2);
    expect(smallBalanceCheckResult[0].token).toEqual("ULT");
    expect(smallBalanceCheckResult[0].token_type).toEqual("erc20");
    expect(smallBalanceCheckResult[0].transferAmount).toEqual("6.4");
    expect(smallBalanceCheckResult[0].isDuplicate).toBeFalsy();

    expect(smallBalanceCheckResult[1].token).toEqual("ETH");
    expect(smallBalanceCheckResult[1].token_type).toEqual("native");
    expect(smallBalanceCheckResult[1].transferAmount).toEqual("3.33");
    expect(smallBalanceCheckResult[1].isDuplicate).toBeFalsy();

    const lessNativeMoreErc20CheckResult = checkAllBalances(
      lessNativeMoreErc20,
      undefined,
      transfers,
    );
    expect(lessNativeMoreErc20CheckResult).toHaveLength(1);
    expect(lessNativeMoreErc20CheckResult[0].token).toEqual("ETH");
    expect(lessNativeMoreErc20CheckResult[0].token_type).toEqual("native");
    expect(lessNativeMoreErc20CheckResult[0].transferAmount).toEqual("3.33");
    expect(lessNativeMoreErc20CheckResult[0].isDuplicate).toBeFalsy();
  });

  it("balance check works for erc721 tokens", () => {
    const transfers: CollectibleTransfer[] = [
      {
        token_type: "erc721",
        tokenAddress: testData.unlistedERC20Token.address,
        tokenId: "69",
        receiver: testData.addresses.receiver1,
        tokenName: "Test Collectible",
        receiverEnsName: null,
        from: testData.addresses.receiver2,
      },
      {
        token_type: "erc721",
        tokenAddress: testData.unlistedERC20Token.address,
        tokenId: "420",
        receiver: testData.addresses.receiver1,
        tokenName: "Test Collectible",
        receiverEnsName: null,
        from: testData.addresses.receiver2,
      },
    ];

    const exactBalance = {
      results: [
        {
          address: testData.unlistedERC20Token.address,
          id: "69",
          tokenName: "Test Collectible",
          tokenSymbol: "TC",
          imageUri: "",
          name: "",
        },
        {
          address: testData.unlistedERC20Token.address,
          id: "420",
          tokenName: "Test Collectible",
          tokenSymbol: "TC",
          imageUri: "",
          name: "",
        },
      ],
      next: null,
      count: 2,
      previous: null,
    };
    const biggerBalance = {
      results: [
        {
          address: testData.unlistedERC20Token.address,
          id: "69",
          tokenName: "Test Collectible",
          tokenSymbol: "TC",
          imageUri: "",
          name: "",
        },
        {
          address: testData.unlistedERC20Token.address,
          id: "420",
          tokenName: "Test Collectible",
          tokenSymbol: "TC",
          imageUri: "",
          name: "",
        },
        {
          address: testData.unlistedERC20Token.address,
          id: "42069",
          tokenName: "Test Collectible",
          tokenSymbol: "TC",
          imageUri: "",
          name: "",
        },
      ],
      next: null,
      count: 3,
      previous: null,
    };
    const smallerBalance = {
      results: [
        {
          address: testData.unlistedERC20Token.address,
          id: "69",
          tokenName: "Test Collectible",
          tokenSymbol: "TC",
          imageUri: "",
          name: "",
        },
      ],
      next: null,
      count: 1,
      previous: null,
    };

    expect(
      checkAllBalances(undefined, exactBalance.results, transfers),
    ).toHaveLength(0);
    expect(
      checkAllBalances(undefined, biggerBalance.results, transfers),
    ).toHaveLength(0);
    const smallBalanceCheckResult = checkAllBalances(
      undefined,
      smallerBalance.results,
      transfers,
    );
    expect(smallBalanceCheckResult).toHaveLength(1);
    expect(smallBalanceCheckResult[0].token).toEqual("Test Collectible");
    expect(smallBalanceCheckResult[0].token_type).toEqual("erc721");
    expect(smallBalanceCheckResult[0].id).toEqual("420");
    expect(smallBalanceCheckResult[0].transferAmount).toBeUndefined();
    expect(smallBalanceCheckResult[0].isDuplicate).toBeFalsy();
  });

  it("detects duplicate transfers for erc721 tokens", () => {
    const transfers: CollectibleTransfer[] = [
      {
        token_type: "erc721",
        tokenAddress: testData.unlistedERC20Token.address,
        tokenId: "69",
        receiver: testData.addresses.receiver1,
        receiverEnsName: null,
        from: testData.addresses.receiver2,
      },
      {
        token_type: "erc721",
        tokenAddress: testData.unlistedERC20Token.address,
        tokenId: "69",
        receiver: testData.addresses.receiver2,
        receiverEnsName: null,
        from: testData.addresses.receiver2,
      },
    ];

    const exactBalance = {
      results: [
        {
          address: testData.unlistedERC20Token.address,
          id: "69",
          tokenName: "Test Collectible",
          tokenSymbol: "TC",
          imageUri: "",
          name: "",
        },
      ],
      next: null,
      count: 1,
      previous: null,
    };

    const balanceCheckResult = checkAllBalances(
      undefined,
      exactBalance.results,
      transfers,
    );
    expect(balanceCheckResult).toHaveLength(1);
    expect(balanceCheckResult[0].token).toEqual("Test Collectible");
    expect(balanceCheckResult[0].token_type).toEqual("erc721");
    expect(balanceCheckResult[0].id).toEqual("69");
    expect(balanceCheckResult[0].transferAmount).toBeUndefined();
    expect(balanceCheckResult[0].isDuplicate).toBeTruthy();
  });
});
