import { ethers } from "hardhat";

async function main() {
  const gweiPrice = 15;

  const constructorArgs = {
    name: "OmnimintNft",
    symbol: "OMNFT",
    uri: "https://omnimint.io/uri/nft/",
    contractUri: "https://omnimint.io/uri/contract/",
    royaltyReceiver: "0xc17c646D6300bBff077115e10B1B7FDBe518929B",
    owner: "0x6316415813d97433BED44d29808FB31aaFB810D4",
    maxSupply: 111,
    priceWei: "1000000000000000",
    royaltyFeeBps: 888,
  };

  const Nft = await ethers.getContractFactory("Nft");
  const nft = await Nft.deploy(
    constructorArgs.name,
    constructorArgs.symbol,
    constructorArgs.uri,
    constructorArgs.contractUri,
    constructorArgs.royaltyReceiver,
    constructorArgs.owner,
    constructorArgs.maxSupply,
    constructorArgs.priceWei,
    constructorArgs.royaltyFeeBps,
    {
      gasPrice: gweiPrice * 1000000000,
    }
  );

  await nft.deployed();

  console.log(`NFT (721a) contract deployed to ${nft.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
