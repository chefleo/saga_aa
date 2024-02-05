require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY2;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "localhost",
  networks: {
    tutorialworldV2: {
      chainId: 2705143118829000,
      url: "https://tutorialworldtwo-2705143118829000-1.jsonrpc.testnet-sp1.sagarpc.io",
      accounts: [PRIVATE_KEY], // Private Key of your metamask wallet
    },
  },
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};
