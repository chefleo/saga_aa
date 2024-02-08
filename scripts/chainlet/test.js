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

  // Encoded function needed for calldata in userOp
  const addressBookEncoded = addressBook.interface.encodeFunctionData(
    "addContact",
    ["0xed52E156aa52453f944505AA51117e2Eb82b0b09", "Leonardo"]
  );

  // CREATE: hash(sender or deployer + nonce)
  const sender = await hre.ethers.getCreateAddress({
    from: FACTORY_ADDRESS,
    nonce: FACTORY_NONCE,
  });

  const initCode =
    FACTORY_ADDRESS +
    AccountFactory.interface
      .encodeFunctionData("createAccount", [
        "0xE5f2dd13815a00c7D9F41eE9619afe5859b25f16",
      ])
      .slice(2);

  console.log("initCode", initCode);

  const nonce = await entryPoint.getNonce(sender, 0);

  // Check if is the balance of the smart wallet
  const balance = await entryPoint.balanceOf(sender);
  const balanceEth = hre.ethers.formatUnits(balance, "ether");

  console.log("balanceEth", balanceEth);

  if (balanceEth > 2) {
    console.log(
      "No needed to be funded, balance of the smart wallet:",
      hre.ethers.formatUnits(balance, "ether")
    );
  } else {
    // Fund the smart account
    await entryPoint.depositTo(sender, {
      value: hre.ethers.parseEther("10"),
    });
    console.log("Smart Wallet funded");
  }

  console.log("sender", sender);
  console.log("nonce", nonce);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
