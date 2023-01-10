import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
      },
      {
        version: "0.4.15",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    scrollTestnet: {
      url: 'https://prealpha.scroll.io/l2',
      accounts: [process.env.PRIVATE_KEY!, process.env.PRIVATE_KEY2!, process.env.PRIVATE_KEY3!]
    },
  },
};

export default config;
