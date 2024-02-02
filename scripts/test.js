const hre = require("hardhat");

const ACCOUNT_ADDR = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c";

async function main() {
  const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDR);
  const count = await account.count();
  console.log("count", count);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
