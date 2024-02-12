const hre = require("hardhat");

const EP_ADDRESS = "0x9FA068d3c4EF70f80a2eA2Ff992E3b12E810bb12";
const PM_ADDRESS = "0x83a41bE26bE9A0510A50984751712275a9a21BFf";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  const balance = await entryPoint.balanceOf(PM_ADDRESS);
  const balanceEth = hre.ethers.formatUnits(balance, "ether");

  if (balanceEth > 1) {
    console.log(
      "No needed to be funded, balance of the PM:",
      hre.ethers.formatUnits(balance, "ether")
    );
  } else {
    await entryPoint.depositTo(PM_ADDRESS, {
      value: hre.ethers.parseEther("10"),
    });
    console.log("Paymaster funded");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
