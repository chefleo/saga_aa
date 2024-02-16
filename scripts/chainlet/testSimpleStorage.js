const hre = require("hardhat");

const SimpleStorage_ADDR = "0x2f733E995CD44432f319e787AC08268a3a7b7AF8";

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
