const hre = require("hardhat");

const SimpleStorage_ADDR = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";

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