require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "localhost",
  networks: {
    tutorialworldV2: {
      chainId: 2705143118829000,
      // If you use Chainlet Testnet it will be with --> .jsonrpc.testnet.sagarpc.io
      // If you use Mainnet it will be with --> .jsonrpc.sagarpc.io
      url: "https://tutorialworldtwo-2705143118829000-1.jsonrpc.testnet.sagarpc.io",
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
