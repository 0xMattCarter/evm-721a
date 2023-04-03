// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MyProxy is Ownable {
  mapping(address => address) public proxies;

  constructor(address _owner) {
    transferOwnership(_owner);
  }

  function setProxy(address _owner, address _operator) public onlyOwner {
    proxies[_owner] = _operator;
  }
}
