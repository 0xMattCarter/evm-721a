import * as dotenv from "dotenv";
import { cleanEnv, num, str, bool } from "envalid";

dotenv.config();

export default cleanEnv(process.env, {
  MAINNET_ETHERSCAN_API_KEY: str(),
  OPTIMISM_ETHERSCAN_API_KEY: str(),
  ARBITRUM_ETHERSCAN_API_KEY: str(),

  ALCHEMY_API_KEY_ETH_GOERLI: str(),
  ALCHEMY_API_KEY_ARB_GOERLI: str(),
  // ALCHEMY_API_KEY_OP_GOERLI: str(),
  ALCHEMY_API_KEY_ARB_MAINNET: str(),

  M1_PRIVATE_KEY: str(),
});
