// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract dBank is Ownable {

  //assign Token contract to variable
  Token private token;
  // 1 eth can buy 10 of our token
  uint exchangeRate = 10;

  //add mappings
  mapping(address => uint) public etherBalanceOf;
  mapping(address => bool) public isDeposited;
  mapping(address => uint) public depositStart;

  //add events
  event Deposit(address indexed user, uint etherAmount, uint timeStart);
  event Withdraw(address indexed user, uint etherAmount, uint depositTime, uint interest);
  event Exchange(address indexed user, uint etherAmount, uint dbcAmount);

  //pass as constructor argument deployed Token contract
  constructor(Token _token_address) {
    //assign token deployed contract to variable
    token = _token_address;
  }

  function deposit() payable public {
    //check if msg.sender didn't already deposited funds
    require(isDeposited[msg.sender] == false, "can only have 1 active deposit");
    //check if msg.value is >= than 0.01 ETH
    require(msg.value >= 10**18 * 0.01, "minimum 0.01 ETH deposit");

    //increase msg.sender ether deposit balance
    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
    //start msg.sender hodling time
    // depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;
    depositStart[msg.sender] = block.timestamp;

    //set msg.sender deposit status to true
    isDeposited[msg.sender] = true;
    //emit Deposit event
    emit Deposit(msg.sender, msg.value, block.timestamp);
  }

  function withdraw() public {
    //check if msg.sender deposit status is true
    require(isDeposited[msg.sender] == true, "must deposit before withdraw");
    //assign msg.sender ether deposit balance to variable for event
    uint userBalance = etherBalanceOf[msg.sender];

    //check user's hodl time
    uint depositTime = block.timestamp - depositStart[msg.sender];

    //calc interest per second
    // uint interestPerSecondPerMinDeposit = 31668017; // actually wrong calculation but the test is hardcoded with this from the tutorial
    // uint interestPerSecond = interestPerSecondPerMinDeposit * (userBalance / (10**18 * 0.01));
    // new interest is 10% of eth deposited per second
    uint interestPerSecond = userBalance / 10;
    //calc accrued interest
    uint interest = interestPerSecond * depositTime;

    //send eth to user
    msg.sender.transfer(userBalance);
    //send interest in tokens to user
    token.mint(msg.sender, interest);

    //reset depositer data
    depositStart[msg.sender] = 0;
    etherBalanceOf[msg.sender] = 0;
    isDeposited[msg.sender] = false;

    //emit event
    emit Withdraw(msg.sender, userBalance, depositTime, interest);
  }

  function exchange() payable public {
    uint dbcAmount = msg.value * exchangeRate;
    token.mint(msg.sender, dbcAmount);

    emit Exchange(msg.sender, msg.value, dbcAmount);
  }

  function drain() external onlyOwner {
    msg.sender.transfer(address(this).balance);
  }

  function borrow() payable public {
    //check if collateral is >= than 0.01 ETH
    //check if user doesn't have active loan

    //add msg.value to ether collateral

    //calc tokens amount to mint, 50% of msg.value

    //mint&send tokens to user

    //activate borrower's loan status

    //emit event
  }

  function payOff() public {
    //check if loan is active
    //transfer tokens from user back to the contract

    //calc fee

    //send user's collateral minus fee

    //reset borrower's data

    //emit event
  }
}
