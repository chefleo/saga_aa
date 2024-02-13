const hre = require("hardhat");

const SimpleStorage_ADDR = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
  const simpleStorage = await hre.ethers.getContractAt(
    "SimpleStorage",
    SimpleStorage_ADDR
  );
  const storedData = await simpleStorage.get();
  console.log("storedData", storedData);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
