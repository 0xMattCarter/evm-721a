import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";
import { defineReadOnly, ParamType } from "ethers/lib/utils";

var deployer: any, owner: any, account1: any;

/// Deployment/testing params
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
};

describe("ERC-721A TESTING", () => {
  var Nft: any;
  var nft: any;
  beforeEach(async () => {
    /// Get accounts
    [deployer, owner, account1] = await ethers.getSigners();
    /// Deploy Nft
    Nft = await ethers.getContractFactory("Nft");
    nft = await Nft.deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.uri,
      deployParams.contractUri,
      deployParams.royaltyReceiver,
      owner.address,
      deployParams.maxSupply,
      deployParams.priceWei,
      deployParams.royaltyFeeBps
    );
    await nft.deployed();
  });

  describe("Deployment", () => {
    it("Sets deployment params correctly", async () => {
      expect(await nft.name()).to.equal(deployParams.name);
      expect(await nft.symbol()).to.equal(deployParams.symbol);
      expect(await nft.URI()).to.equal(deployParams.uri);
      expect(await nft.contractURI()).to.equal(deployParams.contractUri);
      expect(await nft.royaltyReceiver()).to.equal(
        deployParams.royaltyReceiver
      );
      expect(await nft.owner()).to.equal(owner.address);
      expect(await nft.MAX_SUPPLY()).to.equal(deployParams.maxSupply);
      expect(await nft.priceWei()).to.equal(deployParams.priceWei);
      expect(await nft.royaltyFeeBps()).to.equal(deployParams.royaltyFeeBps);

      /// get gas cost of minting 1 NFT and a few
    });
    it("Transfers Ownership upon deployment", async () => {
      /// Transfer ownership to account1
      await nft.connect(owner).transferOwnership(account1.address);
      /// `owner` & `deployer` should not be able to toggle minting while `account1` is the contract owner
      await expect(nft.connect(deployer).toggleMinting()).to.be.reverted;
      await expect(nft.connect(owner).toggleMinting()).to.be.reverted;
      /// `account1` should be able to toggle minting
      await nft.connect(account1).toggleMinting();
      /// Transfer ownership back to `owner`
      await nft.connect(account1).transferOwnership(owner.address);
      /// Only `owner` should be able to toggle minting
      await expect(nft.connect(account1).toggleMinting()).to.be.reverted;
      await nft.connect(owner).toggleMinting();
    });
  });

  describe("Owner", () => {
    it("Can set URI", async () => {
      /// Expected to revert when not `owner`
      await expect(nft.connect(account1).setURI("no")).to.be.reverted;
      await expect(nft.connect(deployer).setURI("no!")).to.be.reverted;
      await nft.connect(owner).setURI(deployParams.uri2);
      expect(await nft.URI()).to.equal(deployParams.uri2);
    });
    it("Can set contractURI", async () => {
      /// Expected to revert when not `owner`
      await expect(nft.connect(account1).setContractURI("no")).to.be.reverted;
      await expect(nft.connect(deployer).setContractURI("no!")).to.be.reverted;
      await nft.connect(owner).setContractURI(deployParams.contractUri2);
      expect(await nft.contractURI()).to.equal(deployParams.contractUri2);
    });
    it("Can set price", async () => {
      /// Expected to revert when not `owner`
      await expect(nft.connect(account1).setPrice("111")).to.be.reverted;
      await expect(nft.connect(deployer).setPrice("222")).to.be.reverted;
      await nft.connect(owner).setPrice("333");
      expect(await nft.priceWei()).to.equal("333");
    });

    it("Can set royalty receiver", async () => {
      /// Expected to revert when not `owner`
      await expect(
        nft.connect(account1).setRoyaltyReceiver(deployParams.royaltyReceiver)
      ).to.be.reverted;
      await expect(
        nft.connect(deployer).setRoyaltyReceiver(deployParams.royaltyReceiver)
      ).to.be.reverted;
      await nft
        .connect(owner)
        .setRoyaltyReceiver(deployParams.royaltyReceiver2);
      expect(await nft.royaltyReceiver()).to.equal(
        deployParams.royaltyReceiver2
      );
    });
    it("Can set royalty bps", async () => {
      /// Expected to revert when not `owner`
      await expect(nft.connect(account1).setRoyaltyFeeBps(1)).to.be.reverted;
      await expect(nft.connect(deployer).setRoyaltyFeeBps(1)).to.be.reverted;
      await nft.connect(owner).setRoyaltyFeeBps(2);
      expect(await nft.royaltyFeeBps()).to.equal(2);
    });
    it("Can toggle minting", async () => {
      /// Expected to revert when not `owner`
      await expect(nft.connect(account1).toggleMinting()).to.be.reverted;
      await expect(nft.connect(deployer).toggleMinting()).to.be.reverted;
      await nft.connect(owner).toggleMinting();
      expect(await nft.isMinting()).to.equal(true);
    });
    it("Can toggle reveal", async () => {
      /// Expected to revert when not `owner`
      await expect(nft.connect(account1).toggleReveal()).to.be.reverted;
      await expect(nft.connect(deployer).toggleReveal()).to.be.reverted;
      await nft.connect(owner).toggleReveal();
      expect(await nft.isRevealed()).to.equal(true);
    });
    it("Can withdraw funds (correct amounts)", async () => {
      /// Balances before mint
      const addrBal1 = await ethers.provider.getBalance(account1.address);
      const contractBal1 = await ethers.provider.getBalance(nft.address);
      /// Mint
      await nft.connect(owner).toggleMinting();
      await nft.connect(owner).mintTokens(2, {
        value: BigNumber.from(deployParams.priceWei).mul(2),
      });
      /// Balances after mint
      const contractBal2 = await ethers.provider.getBalance(nft.address);
      /// Contract balance increases cost of 2 mints
      expect(
        BigNumber.from(contractBal2).sub(BigNumber.from(contractBal1))
      ).to.equal(BigNumber.from(deployParams.priceWei).mul(2));
      /// Withdraw from contract -> account2
      await nft.connect(owner).withdraw(account1.address);
      /// Expected to revert when not owner
      await expect(nft.connect(account1).withdraw(account1.address)).to.be
        .reverted;
      await expect(nft.connect(deployer).withdraw(deployer.address)).to.be
        .reverted;

      /// Balances after withdraw
      const addrBal2 = await ethers.provider.getBalance(account1.address);
      const contractBal3 = await ethers.provider.getBalance(nft.address);

      /// `account1` balance increases by cost of 2 mints due to withdraw
      expect(BigNumber.from(addrBal2).sub(BigNumber.from(addrBal1))).to.equal(
        BigNumber.from(deployParams.priceWei).mul(2).sub("24198802048386") // gas to revert txn above
      );
      /// Contract balance is 0
      expect(BigNumber.from(contractBal3)).to.equal(contractBal1);
    });
    it("Calculates royalty ammount correct when changed", async () => {
      const salePrice = "10000";
      const tokenId = 1;
      /// Init royalty info for sale
      const data = await nft.royaltyInfo(tokenId, salePrice);
      const addr1 = data[0];
      const roy1 = data[1];
      /// Expected to fail when not `owner`
      await expect(nft.connect(account1).setRoyaltyReceiver(account1.address))
        .to.be.reverted;
      await expect(nft.connect(account1).setRoyaltyFeeBps(999)).to.be.reverted;
      await expect(nft.connect(deployer).setRoyaltyReceiver(deployer.address))
        .to.be.reverted;
      await expect(nft.connect(deployer).setRoyaltyFeeBps(999)).to.be.reverted;
      /// Set royalty receiver
      await nft.connect(owner).setRoyaltyReceiver(account1.address);
      /// Set royalty fee
      await nft.connect(owner).setRoyaltyFeeBps(333);
      /// New royalty info for sale
      const data2 = await nft.royaltyInfo(tokenId, salePrice);
      const addr2 = data2[0];
      const roy2 = data2[1];

      expect(roy1).to.equal("888");
      expect(roy2).to.equal("333");
      expect(addr1).to.equal(deployParams.royaltyReceiver);
      expect(addr2).to.equal(account1.address);
    });
    it("Can owner mint", async () => {
      /// Expected to revert when minting disabled
      await expect(nft.connect(owner).mintTokensAsOwner(1, account1.address)).to
        .be.reverted;
      /// Enable minting
      await nft.connect(owner).toggleMinting();
      /// Expected to revert when not owner
      await expect(nft.connect(account1).mintTokensAsOwner(1, account1.address))
        .to.be.reverted;
      await expect(nft.connect(deployer).mintTokensAsOwner(1, deployer.address))
        .to.be.reverted;
      /// Mint 3 tokens
      await nft.connect(owner).mintTokensAsOwner(3, account1.address);
      expect(await nft.balanceOf(account1.address)).to.equal(3);
    });
  });
  describe("Public", () => {
    it("Can mint with >= price", async () => {
      const price = await nft.priceWei();
      /// Expected to revert when minting is disabled
      await expect(nft.connect(owner).mintTokens(1, { value: price })).to.be
        .reverted;
      /// Enable minting
      await nft.connect(owner).toggleMinting();
      /// Mint 1 token with `price`
      await nft.connect(account1).mintTokens(1, { value: price });
      /// Mint 1 token with `price` + 1
      await nft.connect(account1).mintTokens(1, { value: price.add(1) });
      /// Expected to revert when sending < `price`
      await expect(nft.connect(account1).mintTokens(1, { value: price.sub(1) }))
        .to.be.reverted;
      expect(await nft.balanceOf(account1.address)).to.equal(2);
    });
  });
  describe("State", () => {
    it("First token is token id 1", async () => {
      const price = BigNumber.from(await nft.priceWei());

      /// Can't get owner of token before minting it
      await expect(nft.ownerOf(0)).to.be.reverted;
      await expect(nft.ownerOf(1)).to.be.reverted;
      await expect(nft.ownerOf(2)).to.be.reverted;

      /// Mint 3 tokens
      await nft.connect(owner).toggleMinting();
      await nft.connect(account1).mintTokens(2, { value: price.mul(2) });
      await nft.connect(deployer).mintTokens(1, { value: price });

      /// Token owners after mint
      await expect(nft.ownerOf(0)).to.be.reverted; /// Token 0 should still not exist

      expect(await nft.ownerOf(1)).to.equal(account1.address);
      expect(await nft.ownerOf(2)).to.equal(account1.address);
      expect(await nft.ownerOf(3)).to.equal(deployer.address);
    });
    it("totalSupply() is accurate", async () => {
      const price = await nft.priceWei();

      /// Supply is 0
      var sup = await nft.totalSupply();

      /// Mint 1 token
      await nft.connect(owner).toggleMinting();
      await nft.connect(account1).mintTokens(1, { value: price });

      /// Supply is 1
      var sup = await nft.totalSupply();
      expect(sup).to.equal(1);

      /// Mint 9 tokens
      await nft.connect(account1).mintTokens(9, { value: price.mul(9) });

      /// Supply is 10
      var sup = await nft.totalSupply();
      expect(sup).to.equal(10);

      /// Mint 5 tokens as owner
      await nft.connect(owner).mintTokensAsOwner(5, account1.address);

      /// Supply is 15
      var sup = await nft.totalSupply();
      expect(sup).to.equal(15);
    });
    it("Stops at max supply", async () => {
      const price = await nft.priceWei();
      const max = await nft.MAX_SUPPLY();

      /// Mint max supply - 1 tokens as public
      await nft.connect(owner).toggleMinting();
      await nft.connect(account1).mintTokens(max - 1, {
        value: price.mul(max - 1),
        from: account1.address,
      });

      /// Mint 1 token as owner
      await nft.connect(owner).mintTokensAsOwner(1, account1.address);

      /// Supply is max supply
      var sup = await nft.totalSupply();
      expect(sup).to.equal(max);

      /// Expected to revert when minting more than max supply
      await expect(nft.connect(owner).mintTokensAsOwner(1, account1.address)).to
        .be.reverted;
      await expect(
        nft
          .connect(account1)
          .mintTokens(1, { value: price, from: account1.address })
      ).to.be.reverted;
    });
  });
  describe("Reads", () => {
    it("URI updates on reveal", async () => {
      const price = BigNumber.from(await nft.priceWei());

      /// Mint 2 tokens and check URI
      await nft.connect(owner).toggleMinting();
      await nft.connect(account1).mintTokens(2, { value: price.mul(2) });

      expect(await nft.tokenURI(1)).to.equal(deployParams.uri);
      expect(await nft.tokenURI(2)).to.equal(deployParams.uri);

      /// Reveal and check URI
      await nft.connect(owner).toggleReveal();

      expect(await nft.tokenURI(1)).to.equal(deployParams.uri + "1.json");
      expect(await nft.tokenURI(2)).to.equal(deployParams.uri + "2.json");

      /// Update URI and check URI
      await nft.connect(owner).setURI(deployParams.uri2);

      expect(await nft.tokenURI(1)).to.equal(deployParams.uri2 + "1.json");
      expect(await nft.tokenURI(2)).to.equal(deployParams.uri2 + "2.json");
    });
    it("Supports all 4 interfaces", async () => {
      expect(await nft.supportsInterface("0x2a55205a")).to.equal(true); /// EIP-2981
      expect(await nft.supportsInterface("0x01ffc9a7")).to.equal(true); /// ERC165 interface ID for ERC165
      expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true); /// ERC165 interface ID for ERC721
      expect(await nft.supportsInterface("0x5b5e139f")).to.equal(true); /// ERC165 interface ID for ERC721Metadata
    });
  });
});
