const { ethers } = require("hardhat");
const hre = require("hardhat");

const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0x1DAD8AC2be76a2E74Ffa742d8A8DE0E00501Ab25";
const EP_ADDRESS = "0x3104cAfc515Dce32520ad28432725DD7D252023E";
const SimpleStorage_ADDR = "0x2f733E995CD44432f319e787AC08268a3a7b7AF8";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const simpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const Account = await hre.ethers.getContractFactory("Account");

  // This will be the owner of the smart account
  const [signer0] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();

  const sender = await hre.ethers.getCreateAddress({
    from: FACTORY_ADDRESS,
    nonce: FACTORY_NONCE,
  });

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

  // Encoded function needed for calldata in userOp
  const simpleStorageEncoded = simpleStorage.interface.encodeFunctionData(
    "set",
    [5]
  );

  const balance = await entryPoint.balanceOf(sender);
  const balanceEth = hre.ethers.formatUnits(balance, "ether");

  if (balanceEth > 1) {
    console.log(
      "No needed to be funded, balance of the PM:",
      hre.ethers.formatUnits(balance, "ether")
    );
  } else {
    await entryPoint.depositTo(sender, {
      value: hre.ethers.parseEther("10"),
    });
    console.log("Smart Wallet funded");
  }

  const userOp = {
    sender, // smart account address
    nonce,
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
    paymasterAndData: "0x",
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
