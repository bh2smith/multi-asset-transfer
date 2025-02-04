import { parseCsv } from "../src";

import {
  AssetTransfer,
  CodeWarning,
  CollectibleTokenInfo,
  CollectibleTransfer,
  MinimalTokenInfo,
  TokenInfo,
  TokenMap,
  Transfer,
} from "../src/types";
import {
  CollectibleTokenInfoProvider,
  EnsResolver,
  TokenInfoProvider,
} from "../src/interfaces";
import { getAddress } from "viem";

const dummySafeInfo = {
  safeAddress: "0x1230000000000000000000000000000000000000",
  chainId: 4,
  threshold: 1,
  owners: [],
  isReadOnly: true,
};

const unlistedERC20Token: TokenInfo = {
  address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  decimals: 18,
  symbol: "UNL",
  name: "Unlisted",
  chainId: -1,
};

const dummyERC721Token: CollectibleTokenInfo = {
  token_type: "erc721",
  address: "0x5500000000000000000000000000000000000000",
};

const dummyERC1155Token: CollectibleTokenInfo = {
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
  dummySafeInfo,
  unlistedERC20Token,
  addresses,
  dummyERC721Token,
  dummyERC1155Token,
};

function tokenMap(tokenList: TokenInfo[]): TokenMap {
  const res: TokenMap = new Map<string, MinimalTokenInfo>();
  for (const token of tokenList) {
    if (token.address) {
      res.set(getAddress(token.address), token);
    }
  }
  return res;
}

export const fetchTokenList = async (chainId: number): Promise<TokenMap> => {
  let tokens: TokenInfo[];
  switch (chainId) {
    case 1:
      const mainnetTokenURL = "https://tokens.coingecko.com/uniswap/all.json";
      tokens = await fetch(mainnetTokenURL)
        .then((response) => response.json())
        .then((response) => response.tokens)
        .catch(() => []);
      break;
    case 4:
      tokens = [
        {
          name: "Wrapped Ether",
          address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
          symbol: "WETH",
          decimals: 18,
          chainId: 4,
          logoURI:
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc778417E063141139Fce010982780140Aa0cD5Ab/logo.png",
        },
        {
          name: "Dai Stablecoin",
          address: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
          symbol: "DAI",
          decimals: 18,
          chainId: 4,
          logoURI:
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
        },
        {
          name: "Maker",
          address: "0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85",
          symbol: "MKR",
          decimals: 18,
          chainId: 4,
          logoURI:
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85/logo.png",
        },
        {
          name: "Uniswap",
          address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
          symbol: "UNI",
          decimals: 18,
          chainId: 4,
          logoURI: "ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg",
        },
        {
          name: "Gnosis Token",
          address: "0xd0dab4e640d95e9e8a47545598c33e31bdb53c7c",
          symbol: "GNO",
          decimals: 18,
          chainId: 4,
          logoURI:
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6810e776880C02933D47DB1b9fc05908e5386b96/logo.png",
        },
        {
          name: "OWL Token",
          address: "0xa7d1c04faf998f9161fc9f800a99a809b84cfc9d",
          symbol: "OWL",
          decimals: 18,
          chainId: 4,
          logoURI:
            "https://gnosis-safe-token-logos.s3.amazonaws.com/0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D.png",
        },
        {
          name: "Gemini Dollar",
          address: "0x784b46a4331f5c7c495f296ae700652265ab2fc6",
          symbol: "GUSD",
          decimals: 2,
          chainId: 4,
          logoURI:
            "https://gnosis-safe-token-logos.s3.amazonaws.com/0x784B46A4331f5c7C495F296AE700652265ab2fC6.png",
        },
        {
          name: "USD Coin",
          address: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
          symbol: "USDC",
          decimals: 6,
          chainId: 4,
          logoURI:
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
        },
        {
          name: "TrueUSD",
          address: "0x0000000000085d4780b73119b644ae5ecd22b376",
          symbol: "TUSD",
          decimals: 18,
          chainId: 4,
          logoURI:
            "https://gnosis-safe-token-logos.s3.amazonaws.com/0x0000000000085d4780b73119b644ae5ecd22b376.png",
        },
      ];
      break;
    default:
      console.warn(`Unimplemented token list for chainId ${chainId}`);
      tokens = [];
  }
  return tokenMap(tokens);
};

const HEADER_ERC20 = "token_type,token_address,receiver,amount";

let tokenList: TokenMap;
let listedToken: MinimalTokenInfo;

const validReceiverAddress = testData.addresses.receiver1;

/**
 * concatenates csv row arrays into one string.
 * @param rows array of row-arrays
 */
const csvStringFromRows = (
  rows: string[][],
  headerRow: string = "token_type,token_address,receiver,amount,id",
): string => {
  return [headerRow, ...rows.map((row) => row.join(","))].join("\n");
};

describe("Parsing CSVs ", () => {
  let mockTokenInfoProvider: TokenInfoProvider;
  let mockCollectibleTokenInfoProvider: CollectibleTokenInfoProvider;
  let mockEnsResolver: EnsResolver;
  let parse: (csvText: string) => Promise<[Transfer[], CodeWarning[]]>;

  beforeEach(async () => {
    tokenList = await fetchTokenList(testData.dummySafeInfo.chainId);
    const fetchTokenFromList = async (tokenAddress: string) =>
      tokenList.get(tokenAddress);

    let listedTokens = Array.from(tokenList.keys());
    const firstTokenInfo = tokenList.get(listedTokens[0]);
    if (typeof firstTokenInfo !== "undefined") {
      listedToken = firstTokenInfo;
    }

    mockTokenInfoProvider = {
      getTokenInfo: fetchTokenFromList,
      getNativeTokenSymbol: () => "ETH",
      getSelectedNetworkShortname: () => "eth",
    };

    mockCollectibleTokenInfoProvider = {
      getFromAddress: () => testData.dummySafeInfo.safeAddress,
      getTokenInfo: async (tokenAddress) => {
        switch (tokenAddress.toLowerCase()) {
          case testData.addresses.dummyErc721Address:
            return testData.dummyERC721Token;
          case testData.addresses.dummyErc1155Address:
            return testData.dummyERC1155Token;
          default:
            return undefined;
        }
      },
      fetchMetaInfo: jest.fn(),
    };

    mockEnsResolver = {
      resolveName: async (ensName: string) => {
        if (ensName.startsWith("0x")) {
          return ensName;
        }
        switch (ensName) {
          case "receiver1.eth":
            return testData.addresses.receiver1;
          case "receiver2.eth":
            return testData.addresses.receiver2;
          case "receiver3.eth":
            return testData.addresses.receiver3;
          case "token.eth":
            return listedToken.address;
          case "error.eth":
            throw new Error("unexpected error!");
          default:
            return null;
        }
      },
      lookupAddress: async (address: string) => {
        switch (address) {
          case testData.addresses.receiver1:
            return "receiver1.eth";
          case testData.addresses.receiver2:
            return "receiver2.eth";
          case testData.addresses.receiver3:
            return "receiver3.eth";
          case listedToken.address:
            return "token.eth";
          default:
            return null;
        }
      },
      isEnsEnabled: async () => true,
    };
    parse = (x) =>
      parseCsv(
        x,
        mockTokenInfoProvider,
        mockCollectibleTokenInfoProvider,
        mockEnsResolver,
      );
  });

  it("should throw errors for invalid CSVs", async () => {
    // this csv contains more values than headers in row1
    const invalidCSV = "head1,header2\nvalue1,value2,value3";
    expect(parse(invalidCSV)).resolves.toEqual([
      [],
      [
        {
          lineNum: 0,
          message: "Unknown header field(s): head1, header2",
          severity: "error",
        },
      ],
    ]);
  });

  it("should skip files with >400 lines of transfers", async () => {
    let largeCSV = csvStringFromRows(
      Array(501).fill([
        "erc20",
        listedToken.address,
        validReceiverAddress,
        "1",
      ]),
      "token_type,token_address,receiver,amount",
    );
    expect(parse(largeCSV)).rejects.toThrow(
      "Max number of lines exceeded. Due to the block gas limit transactions are limited to 500 lines.",
    );
  });

  it("should transform simple, valid CSVs correctly", async () => {
    const rowWithoutDecimal = [
      "erc20",
      listedToken.address,
      validReceiverAddress,
      "1",
    ];
    const rowWithDecimalAmount = [
      "erc20",
      listedToken.address,
      validReceiverAddress,
      "69.420",
    ];
    const rowWithoutTokenAddress = ["native", "", validReceiverAddress, "1"];

    const [payment, warnings] = await parse(
      csvStringFromRows(
        [rowWithoutDecimal, rowWithDecimalAmount, rowWithoutTokenAddress],
        HEADER_ERC20,
      ),
    );
    expect(warnings).toHaveLength(0);
    expect(payment).toHaveLength(3);
    const [
      paymentWithoutDecimal,
      paymentWithDecimal,
      paymentWithoutTokenAddress,
    ] = payment as AssetTransfer[];
    expect(paymentWithoutDecimal.decimals).toEqual(18);
    expect(paymentWithoutDecimal.receiver).toEqual(validReceiverAddress);
    expect(paymentWithoutDecimal.tokenAddress).toEqual(listedToken.address);
    expect(paymentWithoutDecimal.amount).toEqual("1");
    expect(paymentWithoutDecimal.receiverEnsName).toBeNull();

    expect(paymentWithDecimal.receiver).toEqual(validReceiverAddress);
    expect(paymentWithDecimal.tokenAddress?.toLowerCase()).toEqual(
      listedToken.address.toLowerCase(),
    );
    expect(paymentWithDecimal.decimals).toEqual(18);
    expect(paymentWithDecimal.amount).toEqual("69.420");
    expect(paymentWithDecimal.receiverEnsName).toBeNull();

    expect(paymentWithoutTokenAddress.decimals).toEqual(18);
    expect(paymentWithoutTokenAddress.receiver).toEqual(validReceiverAddress);
    expect(paymentWithoutTokenAddress.tokenAddress).toEqual(null);
    expect(paymentWithoutTokenAddress.amount).toEqual("1");
    expect(paymentWithoutTokenAddress.receiverEnsName).toBeNull();
  });

  it("should generate erc20 validation warnings", async () => {
    const rowWithNegativeAmount = [
      "erc20",
      listedToken.address,
      validReceiverAddress,
      "-1",
    ];

    const unlistedTokenWithoutDecimalInContract = [
      "erc20",
      testData.unlistedERC20Token.address,
      validReceiverAddress,
      "1",
    ];
    const rowWithInvalidTokenAddress = [
      "erc20",
      "0x420",
      validReceiverAddress,
      "1",
    ];
    const rowWithInvalidReceiverAddress = [
      "erc20",
      listedToken.address,
      "0x420",
      "1",
    ];

    const [payment, warnings] = await parse(
      csvStringFromRows(
        [
          rowWithNegativeAmount,
          unlistedTokenWithoutDecimalInContract,
          rowWithInvalidTokenAddress,
          rowWithInvalidReceiverAddress,
        ],
        HEADER_ERC20,
      ),
    );
    expect(warnings).toHaveLength(5);
    const [
      warningNegativeAmount,
      warningTokenNotFound,
      warningInvalidTokenAddress,
      warningInvalidTokenAddressForInvalidAddress,
      warningInvalidReceiverAddress,
    ] = warnings;
    expect(payment).toHaveLength(0);

    expect(warningNegativeAmount.message).toEqual(
      "Only positive amounts/values possible: -1",
    );
    expect(warningNegativeAmount.lineNum).toEqual(1);

    expect(warningTokenNotFound.message.toLowerCase()).toEqual(
      `no token contract was found at ${testData.unlistedERC20Token.address.toLowerCase()}`,
    );
    expect(warningTokenNotFound.lineNum).toEqual(2);

    expect(warningInvalidTokenAddress.message).toEqual(
      "Invalid Token Address: 0x420",
    );
    expect(warningInvalidTokenAddress.lineNum).toEqual(3);
    expect(warningInvalidTokenAddressForInvalidAddress.message).toEqual(
      `No token contract was found at 0x420`,
    );
    expect(warningInvalidTokenAddressForInvalidAddress.lineNum).toEqual(3);

    expect(warningInvalidReceiverAddress.message).toEqual(
      "Invalid Receiver Address: 0x420",
    );
    expect(warningInvalidReceiverAddress.lineNum).toEqual(4);
  });

  it("tries to resolve ens names", async () => {
    const receiverEnsName = [
      "erc20",
      listedToken.address,
      "receiver1.eth",
      "1",
    ];
    const tokenEnsName = ["erc20", "token.eth", validReceiverAddress, "69.420"];
    const unknownReceiverEnsName = [
      "erc20",
      listedToken.address,
      "unknown.eth",
      "1",
    ];
    const unknownTokenEnsName = ["erc20", "unknown.eth", "receiver1.eth", "1"];

    const [payment, warnings] = await parse(
      csvStringFromRows(
        [
          receiverEnsName,
          tokenEnsName,
          unknownReceiverEnsName,
          unknownTokenEnsName,
        ],
        HEADER_ERC20,
      ),
    );
    expect(warnings).toHaveLength(3);
    expect(payment).toHaveLength(2);
    const [paymentReceiverEnsName, paymentTokenEnsName] =
      payment as AssetTransfer[];
    const [
      warningUnknownReceiverEnsName,
      warningInvalidTokenAddress,
      warningInvalidContract,
    ] = warnings;
    expect(paymentReceiverEnsName.decimals).toEqual(18);
    expect(paymentReceiverEnsName.receiver).toEqual(
      testData.addresses.receiver1,
    );
    expect(paymentReceiverEnsName.tokenAddress).toEqual(listedToken.address);
    expect(paymentReceiverEnsName.amount).toEqual("1");
    expect(paymentReceiverEnsName.receiverEnsName).toEqual("receiver1.eth");

    expect(paymentTokenEnsName.receiver).toEqual(validReceiverAddress);
    expect(paymentTokenEnsName.tokenAddress?.toLowerCase()).toEqual(
      listedToken.address.toLowerCase(),
    );
    expect(paymentTokenEnsName.decimals).toEqual(18);
    expect(paymentTokenEnsName.amount).toEqual("69.420");
    expect(paymentReceiverEnsName.receiverEnsName).toEqual("receiver1.eth");

    expect(warningUnknownReceiverEnsName.lineNum).toEqual(3);
    expect(warningUnknownReceiverEnsName.message).toEqual(
      "Invalid Receiver Address: unknown.eth",
    );

    expect(warningInvalidTokenAddress.lineNum).toEqual(4);
    expect(warningInvalidTokenAddress.message).toEqual(
      "Invalid Token Address: unknown.eth",
    );

    expect(warningInvalidContract.lineNum).toEqual(4);
    expect(warningInvalidContract.message).toEqual(
      "No token contract was found at unknown.eth",
    );
  });

  it("parses valid collectible transfers", async () => {
    const rowWithErc721AndAddress = [
      "nft",
      testData.addresses.dummyErc721Address,
      validReceiverAddress,
      "",
      "1",
    ];
    const rowWithErc721AndENS = [
      "nft",
      testData.addresses.dummyErc721Address,
      "receiver2.eth",
      "",
      "69",
    ];
    const rowWithErc721AndIDZero = [
      "nft",
      testData.addresses.dummyErc721Address,
      "receiver1.eth",
      "",
      "0",
    ];
    const rowWithErc1155AndAddress = [
      "nft",
      testData.addresses.dummyErc1155Address,
      validReceiverAddress,
      "69",
      "420",
    ];
    const rowWithErc1155AndENS = [
      "nft",
      testData.addresses.dummyErc1155Address,
      "receiver3.eth",
      "9",
      "99",
    ];

    const [payment, warnings] = await parse(
      csvStringFromRows([
        rowWithErc721AndAddress,
        rowWithErc721AndENS,
        rowWithErc721AndIDZero,
        rowWithErc1155AndAddress,
        rowWithErc1155AndENS,
      ]),
    );
    expect(warnings).toHaveLength(0);
    expect(payment).toHaveLength(5);
    const [
      transferErc721AndAddress,
      transferErc721AndENS,
      transferErc721AndIDZero,
      transferErc1155AndAddress,
      transferErc1155AndENS,
    ] = payment as CollectibleTransfer[];
    expect(transferErc721AndAddress.receiver).toEqual(validReceiverAddress);
    expect(transferErc721AndAddress.tokenAddress).toEqual(
      testData.addresses.dummyErc721Address,
    );
    expect(transferErc721AndAddress.amount).toBeUndefined();
    expect(transferErc721AndAddress.tokenId).toEqual("1");
    expect(transferErc721AndAddress.receiverEnsName).toBeNull();

    expect(transferErc721AndENS.receiver).toEqual(testData.addresses.receiver2);
    expect(transferErc721AndENS.tokenAddress).toEqual(
      testData.addresses.dummyErc721Address,
    );
    expect(transferErc721AndENS.tokenId).toEqual("69");
    expect(transferErc721AndENS.amount).toBeUndefined();
    expect(transferErc721AndENS.receiverEnsName).toEqual("receiver2.eth");

    expect(transferErc721AndIDZero.receiver).toEqual(
      testData.addresses.receiver1,
    );
    expect(transferErc721AndIDZero.tokenAddress).toEqual(
      testData.addresses.dummyErc721Address,
    );
    expect(transferErc721AndIDZero.tokenId).toEqual("0");
    expect(transferErc721AndIDZero.amount).toBeUndefined();
    expect(transferErc721AndIDZero.receiverEnsName).toEqual("receiver1.eth");

    expect(transferErc1155AndAddress.receiver).toEqual(validReceiverAddress);
    expect(transferErc1155AndAddress.tokenAddress.toLowerCase()).toEqual(
      testData.addresses.dummyErc1155Address.toLowerCase(),
    );
    expect(transferErc1155AndAddress.amount).not.toBeUndefined();
    expect(transferErc1155AndAddress.amount).toEqual("69");
    expect(transferErc1155AndAddress.tokenId).toEqual("420");
    expect(transferErc1155AndAddress.receiverEnsName).toBeNull();

    expect(transferErc1155AndENS.receiver).toEqual(
      testData.addresses.receiver3,
    );
    expect(transferErc1155AndENS.tokenAddress.toLowerCase()).toEqual(
      testData.addresses.dummyErc1155Address.toLowerCase(),
    );
    expect(transferErc1155AndENS.amount).not.toBeUndefined();
    expect(transferErc1155AndENS.amount).toEqual("9");
    expect(transferErc1155AndENS.tokenId).toEqual("99");
    expect(transferErc1155AndENS.receiverEnsName).toEqual("receiver3.eth");
  });

  it("should generate erc721/erc1155 validation warnings", async () => {
    const rowErc1155WithNegativeValue = [
      "nft",
      testData.addresses.dummyErc1155Address,
      validReceiverAddress,
      "-1",
      "5",
    ];

    const rowErc1155WithDecimalValue = [
      "nft",
      testData.addresses.dummyErc1155Address,
      validReceiverAddress,
      "1.5",
      "5",
    ];

    const rowErc1155WithMissingId = [
      "nft",
      testData.addresses.dummyErc1155Address,
      validReceiverAddress,
      "5",
      "",
    ];

    const rowErc1155WithInvalidTokenAddress = [
      "nft",
      "0xwhoopsie",
      validReceiverAddress,
      "5",
      "5",
    ];

    const rowErc1155WithInvalidReceiverAddress = [
      "nft",
      testData.addresses.dummyErc1155Address,
      "0xwhoopsie",
      "5",
      "5",
    ];

    const rowErc721WithNegativeId = [
      "nft",
      testData.addresses.dummyErc721Address,
      validReceiverAddress,
      "",
      "-20",
    ];

    const rowErc721WithMissingId = [
      "nft",
      testData.addresses.dummyErc721Address,
      validReceiverAddress,
      "",
      "",
    ];

    const rowErc721WithDecimalId = [
      "nft",
      testData.addresses.dummyErc721Address,
      validReceiverAddress,
      "",
      "69.420",
    ];

    const rowErc721WithInvalidToken = [
      "nft",
      "0xwhoopsie",
      validReceiverAddress,
      "",
      "69",
    ];

    const rowErc721WithInvalidReceiver = [
      "nft",
      testData.addresses.dummyErc721Address,
      "0xwhoopsie",
      "",
      "69",
    ];

    const [payment, warnings] = await parse(
      csvStringFromRows([
        rowErc1155WithNegativeValue,
        rowErc1155WithDecimalValue,
        rowErc1155WithMissingId,
        rowErc1155WithInvalidTokenAddress,
        rowErc1155WithInvalidReceiverAddress,
        rowErc721WithNegativeId,
        rowErc721WithDecimalId,
        rowErc721WithMissingId,
        rowErc721WithInvalidToken,
        rowErc721WithInvalidReceiver,
      ]),
    );
    expect(warnings).toHaveLength(14);
    const [
      warningErc1155WithNegativeValue,
      warningErc1155WithDecimalValue,
      warningErc1155WithMissingId,
      warningErc1155WithMissingId2,
      warningErc1155WithInvalidTokenAddress,
      warningErc1155WithInvalidTokenAddress2,
      warningErc1155WithInvalidReceiverAddress,
      warningErc721WithNegativeId,
      warningErc721WithDecimalId,
      warningErc721WithMissingId,
      warningErc721WithMissingId2,
      warningErc721WithInvalidToken,
      warningErc721WithInvalidToken2,
      warningErc721WithInvalidReceiver,
    ] = warnings;
    expect(payment).toHaveLength(0);

    expect(warningErc1155WithNegativeValue.lineNum).toEqual(1);
    expect(warningErc1155WithNegativeValue.message).toEqual(
      "ERC1155 Tokens need a defined value > 0: -1",
    );

    expect(warningErc1155WithDecimalValue.lineNum).toEqual(2);
    expect(warningErc1155WithDecimalValue.message).toEqual(
      "Value / amount of ERC1155 must be an integer: 1.5",
    );

    expect(warningErc1155WithMissingId.lineNum).toEqual(3);
    expect(warningErc1155WithMissingId.message).toEqual(
      "Token IDs must be integer numbers: ''",
    );

    expect(warningErc1155WithMissingId2.lineNum).toEqual(3);
    expect(warningErc1155WithMissingId2.message).toEqual(
      "Only positive Token IDs possible: ''",
    );

    expect(warningErc1155WithInvalidTokenAddress.lineNum).toEqual(4);
    expect(warningErc1155WithInvalidTokenAddress.message).toEqual(
      "Invalid Token Address: 0xwhoopsie",
    );

    expect(warningErc1155WithInvalidTokenAddress2.lineNum).toEqual(4);
    expect(warningErc1155WithInvalidTokenAddress2.message).toEqual(
      "No token contract was found at 0xwhoopsie",
    );

    expect(warningErc1155WithInvalidReceiverAddress.lineNum).toEqual(5);
    expect(warningErc1155WithInvalidReceiverAddress.message).toEqual(
      "Invalid Receiver Address: 0xwhoopsie",
    );

    expect(warningErc721WithNegativeId.lineNum).toEqual(6);
    expect(warningErc721WithNegativeId.message).toEqual(
      "Only positive Token IDs possible: '-20'",
    );

    expect(warningErc721WithDecimalId.lineNum).toEqual(7);
    expect(warningErc721WithDecimalId.message).toEqual(
      "Token IDs must be integer numbers: '69.420'",
    );

    expect(warningErc721WithMissingId.lineNum).toEqual(8);
    expect(warningErc721WithMissingId.message).toEqual(
      "Token IDs must be integer numbers: ''",
    );

    expect(warningErc721WithMissingId2.lineNum).toEqual(8);
    expect(warningErc721WithMissingId2.message).toEqual(
      "Only positive Token IDs possible: ''",
    );

    expect(warningErc721WithInvalidToken.lineNum).toEqual(9);
    expect(warningErc721WithInvalidToken.message).toEqual(
      "Invalid Token Address: 0xwhoopsie",
    );

    expect(warningErc721WithInvalidToken2.lineNum).toEqual(9);
    expect(warningErc721WithInvalidToken2.message).toEqual(
      "No token contract was found at 0xwhoopsie",
    );

    expect(warningErc721WithInvalidReceiver.lineNum).toEqual(10);
    expect(warningErc721WithInvalidReceiver.message).toEqual(
      "Invalid Receiver Address: 0xwhoopsie",
    );
  });

  describe("Support backward compatibility", () => {
    it("fallback to erc20 without token_type", async () => {
      const missingTokenType = [
        "",
        listedToken.address,
        validReceiverAddress,
        "15",
      ];

      const [payment] = await parse(
        csvStringFromRows([missingTokenType], HEADER_ERC20),
      );
      expect(payment).toHaveLength(1);
      const [erc20Transfer] = payment as AssetTransfer[];

      expect(erc20Transfer.token_type).toEqual("erc20");
    });

    it("allow value instead of amount column", async () => {
      const nativeTransfer = [
        "native",
        listedToken.address,
        validReceiverAddress,
        "15",
      ];
      const headerRow = "token_type,token_address,receiver,value";
      const csvString = [headerRow, nativeTransfer.join(",")].join("\n");

      const [payment, warnings] = await parse(csvString);
      expect(warnings).toHaveLength(0);
      expect(payment).toHaveLength(1);
      const [nativeTransferData] = payment as AssetTransfer[];

      expect(nativeTransferData.amount).toEqual("15");
    });
  });
});
