const { ethers } = require("hardhat");
const hre = require("hardhat");

const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0x3bd23D2Fc0250796CC04Ca8c3c302AE243AB55eF";
const EP_ADDRESS = "0x1749637Dc3b459c8927c18BbdCe8D25070849C08";
const AddressBook_ADDR = "0xF36fc46e10308f8B04D5bD0AD7BC330173271D27";

async function main() {
  // This will be the owner of the smart account
  const [signer0] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();

  // EntryPoint contract
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  // AccountFactory and Account Contract
  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const Account = await hre.ethers.getContractFactory("Account");

  // AddressBook Contract and encoded function
  const addressBook = await hre.ethers.getContractFactory("AddressBook");

  // CREATE: hash(sender or deployer + nonce)
  const sender = await hre.ethers.getCreateAddress({
    from: FACTORY_ADDRESS,
    nonce: FACTORY_NONCE,
  });

  /* 
    Nonce stands for Number Only Used Once, 
    and it refers to the identifier number that accompanies every transaction you conduct from your wallet. 
    For example, the first transaction you execute is numbered nonce #1, 
    the second transaction is labelled nonce #2, and so on.
  */
  const nonce = await entryPoint.getNonce(sender, 0);

  // Only for the first time then put the initCode to "0x" otherwise 'FailedOp(0, "AA10 sender already constructed")'
  // Check nonce, if more then 1 iniCode "0x"
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
  console.log("initCode", initCode);

  // Check if is the balance of the smart wallet
  const balance = await entryPoint.balanceOf(sender);
  const balanceEth = hre.ethers.formatUnits(balance, "ether");

  console.log("balanceEth", balanceEth);

  if (balanceEth > 1) {
    console.log(
      "No needed to be funded, balance of the smart wallet:",
      hre.ethers.formatUnits(balance, "ether")
    );
  } else {
    // Fund the smart account
    await entryPoint.depositTo(sender, {
      value: hre.ethers.parseEther("2"),
    });
    console.log("Smart Wallet funded");
  }

  // Encoded function needed for calldata in userOp
  const addressBookEncoded = addressBook.interface.encodeFunctionData(
    "addContact",
    ["0xed52E156aa52453f944505AA51117e2Eb82b0b09", "Leonardo"]
  );

  console.log(`
  userOp = {
    sender: ${sender},
    nonce: ${nonce},
    initCode: ${initCode}, // Creation of the wallet
    callData: ${Account.interface.encodeFunctionData("execute", [
      AddressBook_ADDR,
      0,
      addressBookEncoded,
    ])},

    // Gas section
    callGasLimit: 900_000,
    verificationGasLimit: 200_000,
    preVerificationGas: 100_000,
    maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
    maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),

    // Advanced aa section
    paymasterAndData: "0x",
    signature: "0x",
  }
  `);

  const userOp = {
    sender, // smart account address
    nonce: await entryPoint.getNonce(sender, 0),
    initCode, // Creation of the wallet if first time
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
  console.log("Receipt", receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
