import { HardhatUserConfig } from "hardhat/config";
import configEnv from "./config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";

const ETHERSCAN_API_KEY = configEnv.ETHERSCAN_API_KEY;
const ALCHEMY_API_KEY_ETH_GOERLI = configEnv.ALCHEMY_API_KEY_ETH_GOERLI;
const ALCHEMY_API_KEY_ARB_GOERLI = configEnv.ALCHEMY_API_KEY_ARB_GOERLI;
const m1PrivateKey = configEnv.M1_PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    goerli_eth: {
      chainId: 5,
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY_ETH_GOERLI}`,
      accounts: [m1PrivateKey],
    },
    goerli_arb: {
      chainId: 421613,
      url: `https://arb-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY_ARB_GOERLI}`,
      accounts: [m1PrivateKey],
    },
    testnet_canto: {
      chainId: 740,
      url: `https://eth.plexnode.wtf/`,
      accounts: [m1PrivateKey],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,

    /// For further instructions on how to add support for other networks, see:
    /// https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan#adding-support-for-other-networks
    customChains: [
      {
        network: "canto",
        chainId: 0,
        urls: {
          apiURL: "https://api-goerli.etherscan.io/api",
          browserURL: "https://goerli.etherscan.io",
        },
      },
    ],
  },
};

export default config;
