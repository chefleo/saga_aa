const { ethers } = require("hardhat");
const hre = require("hardhat");

const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
const EP_ADDRESS = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
const PM_ADDRESS = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";
// const AddressBook_ADDR = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
const SimpleStorage_ADDR = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  const sender = await hre.ethers.getCreateAddress({
    from: FACTORY_ADDRESS,
    nonce: FACTORY_NONCE,
  });

  console.log("Sender:", { sender });

  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");

  // This will be the owner of the smart account
  const [signer0] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();

  const nonce = await entryPoint.getNonce(sender, 0);

  var initCode = "";
  if (nonce >= 1) {
    initCode = "0x";
  } else {
    initCode =
      FACTORY_ADDRESS +
      AccountFactory.interface
        .encodeFunctionData("createAccount", [address0])
        .slice(2);
  }

  const balance = await entryPoint.balanceOf(PM_ADDRESS);
  const balanceEth = hre.ethers.formatUnits(balance, "ether");

  if (balanceEth > 1) {
    console.log(
      "No needed to be funded, balance of the PM:",
      hre.ethers.formatUnits(balance, "ether")
    );
  } else {
    await entryPoint.depositTo(PM_ADDRESS, {
      value: hre.ethers.parseEther("100"),
    });
    console.log("Smart Wallet funded");
  }

  // AddressBook Contract and encoded function
  const simpleStorage = await hre.ethers.getContractFactory("SimpleStorage");

  // Encoded function needed for calldata in userOp
  const simpleStorageEncoded = simpleStorage.interface.encodeFunctionData(
    "set",
    [100]
  );

  const Account = await hre.ethers.getContractFactory("Account");

  const userOp = {
    sender, // smart account address
    nonce: await entryPoint.getNonce(sender, 0),
    initCode: initCode, // Creation of the wallet
    callData: Account.interface.encodeFunctionData("execute", [
      SimpleStorage_ADDR,
      0,
      simpleStorageEncoded,
    ]),

    // Gas section
    callGasLimit: 900_000,
    verificationGasLimit: 500_000,
    preVerificationGas: 100_000,
    maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
    maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),

    // Advanced aa section
    paymasterAndData: PM_ADDRESS,
    signature: "0x",
  };

  console.log({ userOp });

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
