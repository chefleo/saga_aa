const hre = require("hardhat");

const SimpleStorage_ADDR = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

async function main() {
  const simpleStorage = await hre.ethers.getContractAt(
    "SimpleStorage",
    SimpleStorage_ADDR
  );

  const storedData = await simpleStorage.get();
  console.log({ storedData });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
