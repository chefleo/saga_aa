const hre = require("hardhat");

async function main() {
  const [signer0] = await hre.ethers.getSigners();
  const signature = signer0.signMessage(
    hre.ethers.getBytes(hre.ethers.id("wee"))
  );

  const Test = await hre.ethers.getContractFactory("Test");
  const test = await Test.deploy(signature);

  console.log("address0", await signer0.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
