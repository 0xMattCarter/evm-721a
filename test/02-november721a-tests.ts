import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";

var deployer: any, owner: any, addr1: any, addr2: any, manager: any;

const deployParams = {
  name: "OmniNFT",
  symbol: "OMNFT",
  uri: "site.io/uris/nfts/",
  uri2: "site.io/uris2/nfts/",
  contractUri: "site.io/uris/contract/contractURI.json",
  contractUri2: "site.io/uris2/contract/contractURI.json",
  royaltyReceiver: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  royaltyReceiver2: "0x6316415813d97433BED44d29808FB31aaFB810D4",
  maxSupply: 888,
  maxMints: 8,
  priceWei: "888000000000000000", // 0.888 ETH
  royaltyFeeBps: "888", // 888/10000 = 8.88%
  zeroAddress: "0x0000000000000000000000000000000000000000",
};

function keccak256(str: string) {
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str));
  return hash;
}

describe("ERC721November Tests\n", () => {
  var Nft: any;
  var nft: any;
  beforeEach(async () => {
    /// Get accounts
    [deployer, owner, addr1, addr2, manager] = await ethers.getSigners();
    /// Deploy Nft
    Nft = await ethers.getContractFactory("ERC721November");
    nft = await Nft.deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.uri,
      deployParams.contractUri,
      owner.address,
      deployParams.royaltyReceiver,
      deployParams.maxSupply,
      deployParams.priceWei,
      deployParams.royaltyFeeBps
    );
    await nft.deployed();
  });
  describe("Deployment", () => {
    it("Params", async () => {
      expect(await nft.name()).to.equal(deployParams.name);
      expect(await nft.symbol()).to.equal(deployParams.symbol);
      expect(await nft.URI()).to.equal(deployParams.uri);
      expect(await nft.contractURI()).to.equal(deployParams.contractUri);
      expect(await nft.owner()).to.equal(owner.address);
      expect(await nft.royaltyReceiver()).to.equal(
        deployParams.royaltyReceiver
      );
      expect(await nft.MAX_SUPPLY()).to.equal(deployParams.maxSupply);
      expect(await nft.priceWei()).to.equal(deployParams.priceWei);
      expect(await nft.royaltyFeeBps()).to.equal(deployParams.royaltyFeeBps);
    });
    it("State", async () => {
      expect(await nft.isMinting()).to.equal(false);
      expect(await nft.isBurning()).to.equal(false);
      expect(await nft.isRevealed()).to.equal(false);
      expect(await nft.proxyRegistryAddress()).to.equal(
        deployParams.zeroAddress
      );
      expect(await nft.totalSupply()).to.equal(0);
      expect(await nft.totalMinted()).to.equal(0);
      expect(await nft.totalBurned()).to.equal(0);
    });
    it("Supports all 4 interfaces", async () => {
      expect(await nft.supportsInterface("0x2a55205a")).to.equal(true); /// EIP-2981
      expect(await nft.supportsInterface("0x01ffc9a7")).to.equal(true); /// ERC165 interface ID for ERC165
      expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true); /// ERC165 interface ID for ERC721
      expect(await nft.supportsInterface("0x5b5e139f")).to.equal(true); /// ERC165 interface ID for ERC721Metadata
    });
    it("First token is token id 1", async () => {
      const price = BigNumber.from(await nft.priceWei());
      /// Can't get owner of token before minting it
      await expect(nft.ownerOf(0)).to.be.reverted;
      await expect(nft.ownerOf(1)).to.be.reverted;
      await expect(nft.ownerOf(2)).to.be.reverted;
      /// Mint 3 tokens
      await nft.connect(owner).toggleMinting();
      await nft.connect(addr1).mintTokens(2, { value: price.mul(2) });
      await nft.connect(deployer).mintTokens(1, { value: price });
      /// Token owners after mint
      await expect(nft.ownerOf(0)).to.be.reverted; /// Token 0 should still not exist
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.ownerOf(2)).to.equal(addr1.address);
      expect(await nft.ownerOf(3)).to.equal(deployer.address);
    });
  });
  describe("Public Minting", () => {
    it("Can mint when `isMinting` == true", async () => {
      await expect(
        nft.connect(addr1).mintTokens(2, { value: await nft.priceWei() })
      ).to.be.reverted;
      await nft.connect(owner).toggleMinting();
      await expect(
        nft
          .connect(addr1)
          .mintTokens(2, { value: (await nft.priceWei()).mul(2) })
      ).to.not.be.reverted;

      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(0);
    });
    it("Can mint for >= `priceWei`", async () => {
      await nft.connect(owner).toggleMinting();
      await expect(
        nft
          .connect(addr1)
          .mintTokens(2, { value: (await nft.priceWei()).mul(2).add("999") })
      ).to.not.be.reverted;
      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(0);
    });
    it("Can not mint for < `priceWei`", async () => {
      await nft.connect(owner).toggleMinting();
      await expect(
        nft
          .connect(addr1)
          .mintTokens(2, { value: (await nft.priceWei()).mul(2).sub(1) })
      ).to.be.reverted;
      expect(await nft.totalSupply()).to.equal(0);
      expect(await nft.totalMinted()).to.equal(0);
      expect(await nft.totalBurned()).to.equal(0);
    });
    it("Stops minting (for public) when `totalMinted` == `maxSupply`", async () => {
      await nft.connect(owner).toggleMinting();
      await nft.connect(addr1).mintTokens(await nft.MAX_SUPPLY(), {
        value: (await nft.priceWei()).mul(await nft.MAX_SUPPLY()),
      });
      await expect(
        nft.connect(addr1).mintTokens(1, { value: await nft.priceWei() })
      ).to.be.reverted;
      expect(await nft.totalSupply()).to.equal(await nft.MAX_SUPPLY());
      expect(await nft.totalMinted()).to.equal(await nft.MAX_SUPPLY());
      expect(await nft.totalBurned()).to.equal(0);
      it("Owner/managers can mint > MAX_SUPPLY", async () => {
        await nft.connect(owner).toggleMinting();
        await nft.connect(addr1).mintTokens(await nft.MAX_SUPPLY(), {
          value: (await nft.priceWei()).mul(await nft.MAX_SUPPLY()),
        });
        await expect(nft.connect(owner).mintTokensSudo(1)).to.not.be.reverted;
        expect(await nft.totalSupply()).to.equal(
          (await nft.MAX_SUPPLY()).add(1)
        );
        expect(await nft.totalMinted()).to.equal(
          (await nft.MAX_SUPPLY()).add(1)
        );
        expect(await nft.totalBurned()).to.equal(0);
      });
    });
  });
  describe("Burning", () => {
    it("Can burn when `isBurning` == true", async () => {
      await nft.connect(owner).toggleMinting();
      await nft
        .connect(addr1)
        .mintTokens(2, { value: (await nft.priceWei()).mul(2) });

      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(0);

      await expect(nft.connect(addr1).burnTokens([1, 2])).to.be.reverted;
      await nft.connect(owner).toggleBurning();
      await expect(nft.connect(manager).burnTokens([1, 2])).to.be.reverted;
      await expect(nft.connect(addr1).burnTokens([1, 2])).to.not.be.reverted;

      expect(await nft.totalSupply()).to.equal(0);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(2);
    });
  });
  describe("Etc", () => {
    it("Calculates Royalties", async () => {
      const royaltyInfo = await nft.connect(addr1).royaltyInfo(1, 10000);
      expect(royaltyInfo.receiver).to.equal(await nft.royaltyReceiver());
      expect(royaltyInfo.royaltyAmount).to.equal(await nft.royaltyFeeBps());
    });

    it("Reveals Tokens", async () => {
      expect(await nft.isRevealed()).to.equal(false);
      expect(await nft.tokenURI(1)).to.equal(deployParams.uri);
      await nft.connect(owner).toggleReveal();
      expect(await nft.isRevealed()).to.equal(true);
      expect(await nft.tokenURI(1)).to.equal(deployParams.uri + "1.json");
    });
    it("Proxy Registry Functions", async () => {
      /// Mint tokens
      await nft.connect(owner).toggleMinting();
      await nft.connect(owner).toggleBurning();
      await nft.connect(addr1).mintTokens(1, { value: await nft.priceWei() });
      /// No approval
      expect(
        await nft.isApprovedForAll(addr1.address, manager.address)
      ).to.equal(false);
      /// Can't transfer
      await expect(
        nft.connect(manager).transferFrom(addr1.address, manager.address, 1)
      ).to.be.reverted;
      /// Can't burn
      await expect(nft.connect(manager).burnTokens([1])).to.be.reverted;
      /// Deploy proxy
      const Proxy = await ethers.getContractFactory("MyProxy");
      const proxy = await Proxy.deploy(owner.address);
      await proxy.deployed();
      /// Add proxy entry
      await proxy.connect(owner).setProxy(addr1.address, manager.address);
      /// Set proxy registy in nft contract
      await nft.connect(owner).setProxyRegistry(proxy.address);
      /// With approval
      expect(
        await nft.isApprovedForAll(addr1.address, manager.address)
      ).to.equal(true);
      /// Can transfer
      await expect(
        nft.connect(manager).transferFrom(addr1.address, manager.address, 1)
      ).to.not.be.reverted;
      /// Prev owner can't burn
      await expect(nft.connect(addr1).burnTokens([1])).to.be.reverted;
      /// New owner can burn
      await expect(nft.connect(manager).burnTokens([1])).to.not.be.reverted;
    });
  });
});
