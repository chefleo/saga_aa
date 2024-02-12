// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract Account is IAccount {
  address public owner;

  constructor(address _owner) {
    owner = _owner;
  }

  function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256)
    external view returns (uint256 validationData) {
      address recovered = ECDSA.recover(ECDSA.toEthSignedMessageHash(userOpHash), userOp.signature);
      return owner == recovered ? 0 : 1; // 0: Not valid signature, 1: Valid signature
    }

  function execute(address contractAddr, uint256 value, bytes calldata func) external {
    _call(contractAddr, value, func);
  }

  function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }
}

contract AccountFactory {
  function createAccount(address owner) external returns (address) {
    Account acc = new Account(owner);
    return address(acc);
  }
}