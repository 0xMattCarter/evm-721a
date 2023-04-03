import { ethers } from "hardhat";

async function main() {
  const gasPriceWei = await ethers.provider.getGasPrice();
  const gasPriceGwei = parseFloat(
    ethers.utils.formatUnits(gasPriceWei, "gwei")
  );

  console.log(`Current gas price: ${gasPriceGwei} gwei\n`);

  const constructorArgs = {
    name: "OmnimintNft",
    symbol: "OMNFT",
    uri: "https://omnimint.io/uri/nft/",
    contractUri: "https://omnimint.io/uri/contract/",
    owner: "0x6316415813d97433BED44d29808FB31aaFB810D4",
    royaltyReceiver: "0xc17c646D6300bBff077115e10B1B7FDBe518929B",
    maxSupply: "8888",
    priceWei: "1000000000000000",
    royaltyFeeBps: "888",
  };

  const Nft = await ethers.getContractFactory("ERC721XP");
  const nft = await Nft.deploy(
    constructorArgs.name,
    constructorArgs.symbol,
    constructorArgs.uri,
    constructorArgs.contractUri,
    constructorArgs.owner,
    constructorArgs.royaltyReceiver,
    constructorArgs.maxSupply,
    constructorArgs.priceWei,
    constructorArgs.royaltyFeeBps,
    {
      gasPrice: gasPriceGwei * 1050000000, // + 5% gasPrice
      // gasLimit: 90000000, // 90 mil
    }
  );

  const tx = await nft.deployed();
  const rec = await tx.deployTransaction.wait();
  console.log(`Contract deployed at: ${nft.address}\n`);

  const gUnits = ethers.BigNumber.from(rec.gasUsed);
  console.log(`Deployment gas units: ${gUnits.toString()}\n`);

  const gweiToEth = (gweiPrice: number) => {
    const wei = ethers.utils.parseUnits(gweiPrice.toString(), "gwei");
    return parseFloat(ethers.utils.formatEther(wei));
  };

  const oneGweiAssumption = gweiToEth(gUnits.toNumber());

  console.log(`Assuming 1.0 gwei: ${oneGweiAssumption} ETH`);
  console.log(`Assuming 0.1 gwei: ${oneGweiAssumption / 10} ETH`);
  console.log(
    `With gasPrice of ${gasPriceGwei} gwei: ${
      oneGweiAssumption * gasPriceGwei
    } ETH`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
