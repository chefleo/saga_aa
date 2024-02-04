const { ethers } = require("hardhat");
const hre = require("hardhat");

const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0x998abeb3E57409262aE5b751f60747921B33613E";
const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const AddressBook_ADDR = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  const sender = await hre.ethers.getCreateAddress({
    from: FACTORY_ADDRESS,
    nonce: FACTORY_NONCE,
  });

  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");

  // This will be the owner of the smart account
  const [signer0] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();

  // "0x";
  const initCode =
    FACTORY_ADDRESS +
    AccountFactory.interface
      .encodeFunctionData("createAccount", [address0])
      .slice(2);

  console.log(sender);

  await entryPoint.depositTo(sender, {
    value: hre.ethers.parseEther("10"),
  });

  const addressBook = await hre.ethers.getContractFactory("AddressBook");
  const addressBookEncoded = addressBook.interface.encodeFunctionData(
    "addContact",
    ["0xed52E156aa52453f944505AA51117e2Eb82b0b09", "Leonardo"]
  );

  const Account = await hre.ethers.getContractFactory("Account");

  const userOp = {
    sender, // smart account address
    nonce: await entryPoint.getNonce(sender, 0),
    initCode, // Creation of the wallet
    callData: Account.interface.encodeFunctionData("execute", [
      AddressBook_ADDR,
      0,
      addressBookEncoded,
    ]),

    // Gas section
    callGasLimit: 900_000,
    verificationGasLimit: 500_000,
    preVerificationGas: 100_000,
    maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
    maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),

    // Advanced aa section
    paymasterAndData: "0x",
    signature: "0x",
  };

  const tx = await entryPoint.handleOps([userOp], address0);
  const receipt = await tx.wait();
  console.log(receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
