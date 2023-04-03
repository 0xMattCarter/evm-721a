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

describe("Managerial Tests\n", () => {
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
  describe("Permit Checking", () => {
    it("Owner has all permits intitally", async () => {
      await expect(nft.connect(owner).setURI(deployParams.uri2)).to.not.be
        .reverted;
      await expect(nft.connect(owner).setContractURI(deployParams.contractUri2))
        .to.not.be.reverted;
      await expect(nft.connect(owner).toggleMinting()).to.not.be.reverted;
      await expect(nft.connect(owner).toggleBurning()).to.not.be.reverted;
      await expect(nft.connect(owner).toggleReveal()).to.not.be.reverted;
      await expect(nft.connect(owner).setPriceWei(777)).to.not.be.reverted;
      await expect(nft.connect(owner).setRoyaltyReceiver(manager.address)).to
        .not.be.reverted;
      await expect(nft.connect(owner).setRoyaltyFeeBps(777)).to.not.be.reverted;
      await expect(nft.connect(owner).setProxyRegistry(manager.address)).to.not
        .be.reverted;
      await expect(nft.connect(owner).withdraw(manager.address)).to.not.be
        .reverted;
      await expect(nft.connect(owner).increaseLevels([1], [1])).to.not.be
        .reverted;
      await expect(nft.connect(owner).decreaseLevels([1], [1])).to.not.be
        .reverted;

      expect(await nft.tokenURI(1)).to.equal(deployParams.uri2 + "1-0.json");
      expect(await nft.contractURI()).to.equal(deployParams.contractUri2);
      expect(await nft.isMinting()).to.equal(true);
      expect(await nft.isBurning()).to.equal(true);
      expect(await nft.isRevealed()).to.equal(true);
      expect(await nft.priceWei()).to.equal(777);
      expect(await nft.royaltyFeeBps()).to.equal(777);
      expect(await nft.royaltyReceiver()).to.equal(manager.address);
      expect(await nft.proxyRegistryAddress()).to.equal(manager.address);

      /// Minting and burning
      await expect(nft.connect(owner).mintTokensSudo([2], [addr1.address])).to
        .not.be.reverted;

      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(0);
      expect(await nft.balanceOf(addr1.address)).to.equal(2);

      await expect(nft.connect(owner).burnTokensSudo([1, 2])).to.not.be
        .reverted;

      expect(await nft.totalSupply()).to.equal(0);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(2);
      expect(await nft.balanceOf(addr1.address)).to.equal(0);
    });
    it("Permitted functions revert when caller has no permits", async () => {
      await expect(nft.connect(manager).setURI(deployParams.uri2)).to.be
        .reverted;
      await expect(
        nft.connect(manager).setContractURI(deployParams.contractUri2)
      ).to.be.reverted;
      await expect(nft.connect(manager).toggleMinting()).to.be.reverted;
      await expect(nft.connect(manager).toggleBurning()).to.be.reverted;
      await expect(nft.connect(manager).toggleReveal()).to.be.reverted;
      await expect(nft.connect(manager).setPriceWei(777)).to.be.reverted;
      await expect(nft.connect(manager).setRoyaltyReceiver(manager.address)).to
        .be.reverted;
      await expect(nft.connect(manager).setRoyaltyFeeBps(777)).to.be.reverted;
      await expect(nft.connect(manager).setProxyRegistry(manager.address)).to.be
        .reverted;
      await expect(nft.connect(manager).mintTokensSudo([2], [addr1.address])).to
        .be.reverted;
      await expect(nft.connect(manager).burnTokensSudo([1, 2])).to.be.reverted;
      await expect(nft.connect(manager).withdraw(manager.address)).to.be
        .reverted;
      await expect(nft.connect(manager).increaseLevels([1], [1])).to.be
        .reverted;
      await expect(nft.connect(manager).decreaseLevels([1], [1])).to.be
        .reverted;

      expect(await nft.tokenURI(1)).to.equal(deployParams.uri);
      expect(await nft.contractURI()).to.equal(deployParams.contractUri);
      expect(await nft.isMinting()).to.equal(false);
      expect(await nft.isBurning()).to.equal(false);
      expect(await nft.isRevealed()).to.equal(false);
      expect(await nft.priceWei()).to.equal(deployParams.priceWei);
      expect(await nft.royaltyFeeBps()).to.equal(deployParams.royaltyFeeBps);
      expect(await nft.royaltyReceiver()).to.equal(
        deployParams.royaltyReceiver
      );
      expect(await nft.proxyRegistryAddress()).to.equal(
        deployParams.zeroAddress
      );
      expect(await nft.totalSupply()).to.equal(0);
      expect(await nft.totalMinted()).to.equal(0);
      expect(await nft.totalBurned()).to.equal(0);
      expect(await nft.balanceOf(addr1.address)).to.equal(0);
    });
    it("Owner can issue permits", async () => {
      const longtime = "10000000000000000000";
      /// Set permits
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.SET_URI(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.SET_CONTRACT_URI(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.TOGGLE_MINTING(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.TOGGLE_BURNING(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.TOGGLE_REVEAL(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.SET_PRICE_WEI(), longtime);
      await nft
        .connect(owner)
        .setPermit(
          manager.address,
          await nft.SET_ROYALTY_FEE_RECEIVER(),
          longtime
        );
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.SET_ROYALTY_FEE(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.SET_PROXY_REGISTRY(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.MINT(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.BURN(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.WITHDRAW(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.INCREASE_LEVELS(), longtime);
      await nft
        .connect(owner)
        .setPermit(manager.address, await nft.DECREASE_LEVELS(), longtime);

      expect(await nft.connect(manager).setURI(deployParams.uri2)).to.not.be
        .reverted;

      expect(
        await nft.connect(manager).setContractURI(deployParams.contractUri2)
      ).to.not.be.reverted;

      /// Manager calling
      expect(await nft.connect(manager).toggleMinting()).to.not.be.reverted;
      expect(await nft.connect(manager).toggleBurning()).to.not.be.reverted;
      expect(await nft.connect(manager).toggleReveal()).to.not.be.reverted;
      expect(await nft.connect(manager).setPriceWei(777)).to.not.be.reverted;
      expect(await nft.connect(manager).setRoyaltyReceiver(manager.address)).to
        .not.be.reverted;
      expect(await nft.connect(manager).setRoyaltyFeeBps(777)).to.not.be;
      expect(await nft.connect(manager).setProxyRegistry(manager.address)).to
        .not.be.reverted;

      expect(await nft.connect(manager).increaseLevels([1], [1])).to.not.be
        .reverted;
      expect(await nft.connect(manager).decreaseLevels([1], [1])).to.not.be
        .reverted;

      /// Checks
      expect(await nft.tokenURI(1)).to.equal(deployParams.uri2 + "1-0.json");
      expect(await nft.contractURI()).to.equal(deployParams.contractUri2);
      expect(await nft.isMinting()).to.equal(true);
      expect(await nft.isBurning()).to.equal(true);
      expect(await nft.isRevealed()).to.equal(true);
      expect(await nft.priceWei()).to.equal(777);
      expect(await nft.royaltyFeeBps()).to.equal(777);
      expect(await nft.royaltyReceiver()).to.equal(manager.address);
      expect(await nft.proxyRegistryAddress()).to.equal(manager.address);
      /// Minting and burning
      await expect(nft.connect(manager).mintTokensSudo([2], [addr1.address])).to
        .not.be.reverted;

      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(0);
      expect(await nft.balanceOf(addr1.address)).to.equal(2);

      await expect(nft.connect(manager).burnTokensSudo([1, 2])).to.not.be
        .reverted;

      expect(await nft.totalSupply()).to.equal(0);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(2);
      expect(await nft.balanceOf(addr1.address)).to.equal(0);
    });
    it("Owner can set managers to issue permits", async () => {
      const longtime = "10000000000000000000";
      /// Const manager rights
      const SET_URI_SUDO = keccak256("SET_URI_SUDO");
      const SET_CONTRACT_URI_SUDO = keccak256("SET_CONTRACT_URI_SUDO");
      const TOGGLE_MINTING_SUDO = keccak256("TOGGLE_MINTING_SUDO");
      const TOGGLE_BURNING_SUDO = keccak256("TOGGLE_BURNING_SUDO");
      const TOGGLE_REVEAL_SUDO = keccak256("TOGGLE_REVEAL_SUDO");
      const SET_PRICE_WEI_SUDO = keccak256("SET_PRICE_WEI_SUDO");
      const SET_ROYALTY_FEE_RECEIVER_SUDO = keccak256(
        "SET_ROYALTY_FEE_RECEIVER_SUDO"
      );
      const SET_ROYALTY_FEE_SUDO = keccak256("SET_ROYALTY_FEE_SUDO");
      const SET_PROXY_REGISTRY_SUDO = keccak256("SET_PROXY_REGISTRY_SUDO");
      const MINT_SUDO = keccak256("MINT_SUDO");
      const BURN_SUDO = keccak256("BURN_SUDO");
      const WITHDRAW_SUDO = keccak256("WITHDRAW_SUDO");
      const INCREASE_LEVELS_SUDO = keccak256("INCREASE_LEVELS_SUDO");
      const DECREASE_LEVELS_SUDO = keccak256("DECREASE_LEVELS_SUDO");
      /// Bind these manager rights to normal rights
      await nft
        .connect(owner)
        .setManagerRight(await nft.SET_URI(), SET_URI_SUDO);
      await nft
        .connect(owner)
        .setManagerRight(await nft.SET_CONTRACT_URI(), SET_CONTRACT_URI_SUDO);
      await nft
        .connect(owner)
        .setManagerRight(await nft.TOGGLE_MINTING(), TOGGLE_MINTING_SUDO);
      await nft
        .connect(owner)
        .setManagerRight(await nft.TOGGLE_BURNING(), TOGGLE_BURNING_SUDO);
      await nft
        .connect(owner)
        .setManagerRight(await nft.TOGGLE_REVEAL(), TOGGLE_REVEAL_SUDO);
      await nft
        .connect(owner)
        .setManagerRight(await nft.SET_PRICE_WEI(), SET_PRICE_WEI_SUDO);
      await nft
        .connect(owner)
        .setManagerRight(
          await nft.SET_ROYALTY_FEE_RECEIVER(),
          SET_ROYALTY_FEE_RECEIVER_SUDO
        );
      await nft
        .connect(owner)
        .setManagerRight(await nft.SET_ROYALTY_FEE(), SET_ROYALTY_FEE_SUDO);
      await nft
        .connect(owner)
        .setManagerRight(
          await nft.SET_PROXY_REGISTRY(),
          SET_PROXY_REGISTRY_SUDO
        );
      await nft.connect(owner).setManagerRight(await nft.MINT(), MINT_SUDO);
      await nft.connect(owner).setManagerRight(await nft.BURN(), BURN_SUDO);
      await nft
        .connect(owner)
        .setManagerRight(await nft.WITHDRAW(), WITHDRAW_SUDO);

      await nft
        .connect(owner)
        .setManagerRight(await nft.INCREASE_LEVELS(), INCREASE_LEVELS_SUDO);
      await nft
        .connect(owner)
        .setManagerRight(await nft.DECREASE_LEVELS(), DECREASE_LEVELS_SUDO);

      /// Give addr1 each manager right
      await nft.connect(owner).setPermit(addr1.address, SET_URI_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, SET_CONTRACT_URI_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, TOGGLE_MINTING_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, TOGGLE_BURNING_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, TOGGLE_REVEAL_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, SET_PRICE_WEI_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, SET_ROYALTY_FEE_RECEIVER_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, SET_ROYALTY_FEE_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, SET_PROXY_REGISTRY_SUDO, longtime);
      await nft.connect(owner).setPermit(addr1.address, MINT_SUDO, longtime);
      await nft.connect(owner).setPermit(addr1.address, BURN_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, WITHDRAW_SUDO, longtime);

      await nft
        .connect(owner)
        .setPermit(addr1.address, INCREASE_LEVELS_SUDO, longtime);
      await nft
        .connect(owner)
        .setPermit(addr1.address, DECREASE_LEVELS_SUDO, longtime);

      /// Addr1 sets manager's rights
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.SET_URI(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.SET_CONTRACT_URI(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.TOGGLE_MINTING(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.TOGGLE_BURNING(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.TOGGLE_REVEAL(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.SET_PRICE_WEI(), longtime);
      await nft
        .connect(addr1)
        .setPermit(
          manager.address,
          await nft.SET_ROYALTY_FEE_RECEIVER(),
          longtime
        );
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.SET_ROYALTY_FEE(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.SET_PROXY_REGISTRY(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.MINT(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.BURN(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.WITHDRAW(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.INCREASE_LEVELS(), longtime);
      await nft
        .connect(addr1)
        .setPermit(manager.address, await nft.DECREASE_LEVELS(), longtime);
      /// Calling as manager
      expect(await nft.connect(manager).setURI(deployParams.uri2)).to.not.be
        .reverted;
      expect(
        await nft.connect(manager).setContractURI(deployParams.contractUri2)
      ).to.not.be.reverted;
      expect(await nft.connect(manager).toggleMinting()).to.not.be.reverted;
      expect(await nft.connect(manager).toggleBurning()).to.not.be.reverted;
      expect(await nft.connect(manager).toggleReveal()).to.not.be.reverted;
      expect(await nft.connect(manager).setPriceWei(777)).to.not.be.reverted;
      expect(await nft.connect(manager).setRoyaltyReceiver(manager.address)).to
        .not.be.reverted;
      expect(await nft.connect(manager).setRoyaltyFeeBps(777)).to.not.be;
      expect(await nft.connect(manager).setProxyRegistry(manager.address)).to.be
        .reverted;
      expect(await nft.connect(manager).increaseLevels([1], [3])).to.not.be
        .reverted;
      expect(await nft.connect(manager).decreaseLevels([1], [1])).to.not.be
        .reverted;

      /// Checks
      expect(await nft.tokenURI(1)).to.equal(deployParams.uri2 + "1-2.json");
      expect(await nft.contractURI()).to.equal(deployParams.contractUri2);
      expect(await nft.isMinting()).to.equal(true);
      expect(await nft.isBurning()).to.equal(true);
      expect(await nft.isRevealed()).to.equal(true);
      expect(await nft.priceWei()).to.equal(777);
      expect(await nft.royaltyFeeBps()).to.equal(777);
      expect(await nft.royaltyReceiver()).to.equal(manager.address);
      expect(await nft.proxyRegistryAddress()).to.equal(manager.address);

      /// Minting and burning
      await expect(nft.connect(manager).mintTokensSudo([2], [addr1.address])).to
        .not.be.reverted;

      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(0);
      expect(await nft.balanceOf(addr1.address)).to.equal(2);

      await expect(nft.connect(manager).burnTokensSudo([1, 2])).to.not.be
        .reverted;

      expect(await nft.totalSupply()).to.equal(0);
      expect(await nft.totalMinted()).to.equal(2);
      expect(await nft.totalBurned()).to.equal(2);
      expect(await nft.balanceOf(addr1.address)).to.equal(0);
    });
  });
});
