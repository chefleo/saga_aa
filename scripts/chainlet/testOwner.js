const hre = require("hardhat");

const ACCOUNT_ADDR = "0xEf226B510c30A997FD1a6597e6a89d329F1286F1";

async function main() {
  // AccountFactory and Account Contract
  const Account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDR);

  const owner = await Account.owner();

  console.log("owner", owner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
