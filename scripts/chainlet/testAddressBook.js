const hre = require("hardhat");

const AddressBook_ADDR = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";

async function main() {
  const addressBook = await hre.ethers.getContractAt(
    "AddressBook",
    AddressBook_ADDR
  );

  const test = await addressBook.test();
  console.log("test", test);

  const contacts = await addressBook.getContacts();
  console.log("contacts", contacts);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
