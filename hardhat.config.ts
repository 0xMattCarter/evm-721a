import { HardhatUserConfig } from "hardhat/config";
import configEnv from "./config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "@eth-optimism/plugins/hardhat/compiler";

const MAINNET_ETHERSCAN_API_KEY = configEnv.MAINNET_ETHERSCAN_API_KEY;
const OPTIMISM_ETHERSCAN_API_KEY = configEnv.OPTIMISM_ETHERSCAN_API_KEY;
const ARBITRUM_ETHERSCAN_API_KEY = configEnv.ARBITRUM_ETHERSCAN_API_KEY;
const ALCHEMY_API_KEY_ETH_GOERLI = configEnv.ALCHEMY_API_KEY_ETH_GOERLI;
const ALCHEMY_API_KEY_ARB_GOERLI = configEnv.ALCHEMY_API_KEY_ARB_GOERLI;
// const ALCHEMY_API_KEY_OP_GOERLI = configEnv.ALCHEMY_API_KEY_OP_GOERLI;
const ALCHEMY_API_KEY_ARB_MAINNET = configEnv.ALCHEMY_API_KEY_ARB_MAINNET;

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
  // ovm: {
  //   solcVersion: "0.7.6", // Your version goes here.
  // },
  networks: {
    goerliEth: {
      chainId: 5,
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY_ETH_GOERLI}`,
      accounts: [m1PrivateKey],
    },
    arbitrum: {
      chainId: 42161,
      // url: `https://arb1.arbitrum.io/rpc`,
      url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_ARB_MAINNET}`,
      accounts: [m1PrivateKey],
    },
    goerliArbitrum: {
      chainId: 421613,
      // url: `https://arb-goerli.g.alchemy.com/v2/`,
      url: `https://arb-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY_ARB_GOERLI}`,
      // url: "https://goerli-rollup.arbitrum.io/rpc",
      accounts: [m1PrivateKey],
    },
    // optimisticGoerli: {
    //   chainId: 420,
    //   // url: `https://opt-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY_OP_GOERLI}}`,
    //   url: `https://goerli.optimism.io`,
    //   accounts: [m1PrivateKey],
    // },
    testnet_canto: {
      chainId: 740,
      url: `https://eth.plexnode.wtf/`,
      accounts: [m1PrivateKey],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: MAINNET_ETHERSCAN_API_KEY,
      optimisticGoerli: OPTIMISM_ETHERSCAN_API_KEY,
      arbitrumGoerli: ARBITRUM_ETHERSCAN_API_KEY,
    },

    /// For further instructions on how to add support for other networks, see:
    /// https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan#adding-support-for-other-networks
    // customChains: [
    //   {
    //     network: "canto",
    //     chainId: 0,
    //     urls: {
    //       apiURL: "https://api-goerli.etherscan.io/api",
    //       browserURL: "https://goerli.etherscan.io",
    //     },
    //   },
    // ],
  },
};

export default config;
