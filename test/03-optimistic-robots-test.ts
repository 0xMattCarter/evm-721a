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

describe("ERC721XP Test\n", () => {
  var Nft: any;
  var nft: any;
  beforeEach(async () => {
    /// Get accounts
    [deployer, owner, addr1, addr2, manager] = await ethers.getSigners();
    /// Deploy Nft
    Nft = await ethers.getContractFactory("ERC721XP");
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

  describe("Level Changes", () => {
    it("Only owner can change levels at first", async () => {
      await expect(nft.connect(manager).increaseLevels([1], [1])).to.be
        .reverted;
      await expect(nft.connect(owner).increaseLevels([1], [10])).to.not.be
        .reverted;

      expect(await nft.levels(1)).to.equal(10);

      await expect(nft.connect(manager).decreaseLevels([1], [1])).to.be
        .reverted;
      await expect(nft.connect(owner).decreaseLevels([1], [3])).to.not.be
        .reverted;

      expect(await nft.levels(1)).to.equal(7);
    });
    it("Array Mismatch Check", async () => {
      await expect(nft.connect(owner).increaseLevels([1, 2], [1])).to.be
        .reverted;

      await expect(nft.connect(owner).increaseLevels([1], [1, 2])).to.be
        .reverted;

      await expect(nft.connect(owner).decreaseLevels([1, 2], [1])).to.be
        .reverted;

      await expect(nft.connect(owner).decreaseLevels([1], [1, 2])).to.be
        .reverted;
    });
    it("Batch Level Changes", async () => {
      await expect(
        nft.connect(owner).increaseLevels([1, 2, 3, 4], [1, 10, 100, 1000])
      ).to.not.be.reverted;

      expect(await nft.levels(1)).to.equal(1);
      expect(await nft.levels(2)).to.equal(10);
      expect(await nft.levels(3)).to.equal(100);
      expect(await nft.levels(4)).to.equal(1000);

      await expect(
        nft.connect(owner).decreaseLevels([1, 2, 3, 4], [1, 1, 1, 1])
      ).to.not.be.reverted;

      expect(await nft.levels(1)).to.equal(0);
      expect(await nft.levels(2)).to.equal(9);
      expect(await nft.levels(3)).to.equal(99);
      expect(await nft.levels(4)).to.equal(999);
    });
    it("Permitted managers can change levels", async () => {
      await expect(nft.connect(manager).increaseLevels([1], [1])).to.be
        .reverted;
      await expect(nft.connect(manager).decreaseLevels([1], [1])).to.be
        .reverted;

      const longtime = "10000000000000000000";

      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.INCREASE_LEVELS(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.DECREASE_LEVELS(), longtime);

      await expect(nft.connect(manager).increaseLevels([1], [10])).to.not.be
        .reverted;

      expect(await nft.levels(1)).to.equal(10);

      await expect(nft.connect(manager).decreaseLevels([1], [1])).to.not.be
        .reverted;

      expect(await nft.levels(1)).to.equal(9);
    });
    it("Owner can permit a manager to give permits", async () => {
      /// addr1 cant increase/decrease levels
      await expect(nft.connect(addr1).increaseLevels([1], [1])).to.be.reverted;
      await expect(nft.connect(addr1).decreaseLevels([1], [1])).to.be.reverted;

      /// create permit for sudo permits
      const incSudo = keccak256("INCREASE_LEVELS_SUDO");
      const decSudo = keccak256("DECREASE_LEVELS_SUDO");

      // give manager permission to increase/decreases levels sudo
      await nft
        .connect(owner)
        .setPermit(manager.address, incSudo, "10000000000000000000");
      await nft
        .connect(owner)
        .setPermit(manager.address, decSudo, "10000000000000000000");

      /// bind sudo permits to rights
      await nft
        .connect(owner)
        .setManagerRight(await nft.INCREASE_LEVELS(), incSudo);
      await nft
        .connect(owner)
        .setManagerRight(await nft.DECREASE_LEVELS(), decSudo);
      /// use manager to grant addr1 permits
      await nft
        .connect(manager)
        .setPermit(
          addr1.address,
          await nft.INCREASE_LEVELS(),
          "10000000000000000000"
        );
      await nft
        .connect(manager)
        .setPermit(
          addr1.address,
          await nft.DECREASE_LEVELS(),
          "10000000000000000000"
        );

      // addr1 can now increase/decrease levels
      await expect(nft.connect(addr1).increaseLevels([1], [10])).to.not.be
        .reverted;
      await expect(nft.connect(addr1).decreaseLevels([1], [5])).to.not.be
        .reverted;

      expect(await nft.levels(1)).to.equal(5);
    });
    it("Can't decrease a level passed 0", async () => {
      await nft.connect(owner).increaseLevels([1], [1]);
      await expect(nft.connect(owner).decreaseLevels([1], [2])).to.be.reverted;
    });
    // it("", async () => {});
  });
  describe("URI", () => {
    it("Reveals tokens", async () => {
      expect(await nft.tokenURI(1)).to.equal(deployParams.uri);

      await nft.connect(owner).toggleReveal();

      expect(await nft.tokenURI(1)).to.equal(deployParams.uri + "1-0.json");
    });
    it("URI updates when level changes", async () => {
      await nft.connect(owner).toggleReveal();

      expect(await nft.tokenURI(1)).to.equal(deployParams.uri + "1-0.json");

      await nft.connect(owner).increaseLevels([1], [11]);

      expect(await nft.tokenURI(1)).to.equal(deployParams.uri + "1-11.json");

      await nft.connect(owner).decreaseLevels([1], [1]);

      expect(await nft.tokenURI(1)).to.equal(deployParams.uri + "1-10.json");
    });
  });
});
