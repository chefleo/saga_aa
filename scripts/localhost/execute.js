const { ethers } = require("hardhat");
const hre = require("hardhat");

const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
// const AddressBook_ADDR = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
const SimpleStorage_ADDR = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  const sender = await hre.ethers.getCreateAddress({
    from: FACTORY_ADDRESS,
    nonce: FACTORY_NONCE,
  });

  console.log("Sender:", { sender });

  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");

  // This will be the owner of the smart account
  const [signer0, signer1] = await hre.ethers.getSigners();
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
    [10]
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

  const userOpHash = await entryPoint.getUserOpHash(userOp);
  userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));

  console.log({ userOpHash }, "userOp sign", userOp.signature);

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
