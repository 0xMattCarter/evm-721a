import * as dotenv from "dotenv";
import { cleanEnv, num, str, bool } from "envalid";

dotenv.config();

export default cleanEnv(process.env, {
  ETHERSCAN_API_KEY: str(),

  ALCHEMY_API_KEY_ETH_GOERLI: str(),
  ALCHEMY_API_KEY_ARB_GOERLI: str(),

  M1_PRIVATE_KEY: str(),
});
