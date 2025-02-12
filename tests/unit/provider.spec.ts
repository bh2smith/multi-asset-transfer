import { zeroAddress } from "viem";
import {
  DefaultCollectibleTokenInfoProvider,
  DefaultEnsResolver,
  DefaultTokenInfoProvider,
} from "../../src/provider";

describe("Default Providers:", () => {
  const chainId = 11155111;
  const sepoliaErc721 = "0xE66be37f6B446079fE71a497312996Dff6Bd963F";
  const sepoliaErc20 = "0x51fce89b9f6d4c530698f181167043e1bb4abf89";
  const tokenProvider = new DefaultTokenInfoProvider(chainId);
  describe("DefaultTokenInfoProvider", () => {
    it("constructor", () => {
      expect(tokenProvider).toBeDefined();
    });

    it("getNativeTokenSymbol", () => {
      expect(tokenProvider.getNativeTokenSymbol()).toBe("ETH");
    });

    it("getTokenInfo", async () => {
      // TODO(bh2smith): mock eth calls!
      expect(await tokenProvider.getTokenInfo(sepoliaErc20)).toStrictEqual({
        address: sepoliaErc20,
        symbol: "USDC",
        decimals: 6,
      });
    });

    it("getSelectedNetworkShortname", async () => {
      expect(await tokenProvider.getSelectedNetworkShortname()).toBe("sep");
    });
  });

  describe("DefaultCollectibleTokenInfoProvider", () => {
    const collectibleProvider = new DefaultCollectibleTokenInfoProvider(
      chainId,
    );
    it("constructor", () => {
      expect(collectibleProvider).toBeDefined();
    });

    it("fetchMetaInfo", async () => {
      expect(
        await collectibleProvider.fetchMetaInfo(sepoliaErc721, "2", "erc721"),
      ).toStrictEqual({
        imageURI:
          "https://assets.manifold.xyz/original/717828be645f64bc077f277f79f02bcd69199f4710a4d6378c551e8c2e13d253.jpg",
        name: "Mintbase Templates",
      });
    });

    it("getTokenInfo", async () => {
      // TODO(bh2smith): mock eth calls!
      expect(
        await collectibleProvider.getTokenInfo(sepoliaErc721, "2"),
      ).toStrictEqual({
        address: sepoliaErc721,
        token_type: "erc721",
      });
    });

    it("getFromAddress", async () => {
      const from = await collectibleProvider.getFromAddress();
      expect(from).toBe(zeroAddress);
    });
  });

  describe("DefaultEnsResolver", () => {
    const ensProvider = new DefaultEnsResolver(chainId);
    const mainnetProvider = new DefaultEnsResolver(1);
    it("constructor", () => {
      expect(ensProvider).toBeDefined();
    });

    it("isEnsEnabled", async () => {
      expect(await ensProvider.isEnsEnabled()).toBe(false);
      expect(await mainnetProvider.isEnsEnabled()).toBe(true);
    });

    it("lookupAddress success", async () => {
      const name = await mainnetProvider.lookupAddress(
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      );
      expect(name).toBe("vitalik.eth");
    });

    it("lookupAddress fails", async () => {
      expect(
        await mainnetProvider.lookupAddress(
          "0xdead6BF26964aF9D7eEd9e03E53415D37aA96045",
        ),
      ).toBe(null);
    });

    it("resolveName success", async () => {
      const address = await mainnetProvider.resolveName("vitalik.eth");
      expect(address).toBe("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
    });

    it("resolveName fails", async () => {
      expect(await mainnetProvider.resolveName("x.eth")).toBe(null);
    });
  });
});
