// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
  //add minter variable
  address public minter;

  //add minter changed event
  event minterChanged(address indexed from, address to);

  // constructor() public payable ERC20("Name", "Symbol") {
  constructor() payable ERC20("Decentralized Bank Currency", "DBC") {
    //asign initial minter
    minter = msg.sender;
  }

  //Add pass minter role function
  function passMinterRole(address newMinter) public returns (bool) {
    require(msg.sender == minter, "must have minter role to pass the role");
    minter = newMinter;

    emit minterChanged(msg.sender, newMinter);
    return true;
  }

  function mint(address account, uint256 amount) public {
    //check if msg.sender have minter role
    require(msg.sender == minter, "only acct(s) with minter role can mint");
		_mint(account, amount);
	}
}