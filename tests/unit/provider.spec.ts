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
  describe("DefaultTokenInfoProvider", () => {
    it("constructor", () => {
      const tokenProvider = new DefaultTokenInfoProvider(chainId);
      expect(tokenProvider).toBeDefined();
    });

    it("getNativeTokenSymbol", () => {
      const tokenProvider = new DefaultTokenInfoProvider(chainId);
      expect(tokenProvider.getNativeTokenSymbol()).toBe("ETH");
    });

    it("getTokenInfo", async () => {
      // TODO(bh2smith): mock eth calls!
      const tokenProvider = new DefaultTokenInfoProvider(chainId);
      expect(await tokenProvider.getTokenInfo(sepoliaErc20)).toStrictEqual({
        address: sepoliaErc20,
        symbol: "USDC",
        decimals: 6,
      });
    });

    it("getSelectedNetworkShortname", async () => {
      const tokenProvider = new DefaultTokenInfoProvider(chainId);
      expect(await tokenProvider.getSelectedNetworkShortname()).toBe("sep");
    });
  });

  describe("DefaultCollectibleTokenInfoProvider", () => {
    it("constructor", () => {
      const tokenProvider = new DefaultCollectibleTokenInfoProvider(chainId);
      expect(tokenProvider).toBeDefined();
    });

    it("fetchMetaInfo", async () => {
      const provider = new DefaultCollectibleTokenInfoProvider(chainId);
      expect(
        await provider.fetchMetaInfo(sepoliaErc721, "2", "erc721"),
      ).toStrictEqual({
        imageURI:
          "https://assets.manifold.xyz/original/717828be645f64bc077f277f79f02bcd69199f4710a4d6378c551e8c2e13d253.jpg",
        name: "Mintbase Templates",
      });
    });

    it("getTokenInfo", async () => {
      // TODO(bh2smith): mock eth calls!
      const provider = new DefaultCollectibleTokenInfoProvider(chainId);
      expect(await provider.getTokenInfo(sepoliaErc721, "2")).toStrictEqual({
        address: sepoliaErc721,
        token_type: "erc721",
      });
    });

    it("getFromAddress", async () => {
      const provider = new DefaultCollectibleTokenInfoProvider(chainId);
      const from = await provider.getFromAddress();
      expect(from).toBe(zeroAddress);
    });
  });

  describe("DefaultEnsResolver", () => {
    it("constructor", () => {
      const tokenProvider = new DefaultEnsResolver(chainId);
      expect(tokenProvider).toBeDefined();
    });

    it("isEnsEnabled", async () => {
      expect(await new DefaultEnsResolver(chainId).isEnsEnabled()).toBe(false);

      const mainnetProvider = new DefaultEnsResolver(1);
      const enabled = await mainnetProvider.isEnsEnabled();
      expect(enabled).toBe(true);
    });

    it("lookupAddress success", async () => {
      const mainnetProvider = new DefaultEnsResolver(1);
      const name = await mainnetProvider.lookupAddress(
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      );
      expect(name).toBe("vitalik.eth");
    });

    it("lookupAddress fails", async () => {
      const mainnetProvider = new DefaultEnsResolver(1);
      expect(
        await mainnetProvider.lookupAddress(
          "0xdead6BF26964aF9D7eEd9e03E53415D37aA96045",
        ),
      ).toBe(null);
    });

    it("resolveName success", async () => {
      const mainnetProvider = new DefaultEnsResolver(1);
      const address = await mainnetProvider.resolveName("vitalik.eth");
      expect(address).toBe("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
    });

    it("resolveName fails", async () => {
      const mainnetProvider = new DefaultEnsResolver(1);
      expect(await mainnetProvider.resolveName("x.eth")).toBe(null);
    });
  });
});
