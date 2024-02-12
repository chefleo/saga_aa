// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";


contract Account is IAccount {
  address public owner;

  constructor(address _owner) {
    owner = _owner;
  }

  function validateUserOp(UserOperation calldata, bytes32, uint256)
    external pure returns (uint256 validationData) {
      // Allow anybody to interact with this account
      return 0;
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