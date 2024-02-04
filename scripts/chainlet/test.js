const hre = require("hardhat");

const ACCOUNT_ADDR = "0xb4dC171C0edEc8C0032cd0f2d30921c09FA35e34";

async function main() {
  const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDR);
  const owner = await account.owner();
  console.log("owner", owner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
