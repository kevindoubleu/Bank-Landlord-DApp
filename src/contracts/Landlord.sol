// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./Token.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";

contract Landlord {
  // using SafeMath for uint;

  event LandClaimed (uint landX, uint landY, address by, uint price);
  event LandSeized  (uint landX, uint landY, address from, address to, uint oldPrice, uint newPrice);

  struct Land {
    uint x;
    uint y;
  }
  Land[] public lands; // index is land id

  mapping (uint => address) public landToOwner; // land id to owner
  mapping (address => uint) public ownedLandCount;

  mapping (bytes32 => uint) public landPrices; // land hash to land price


  Token private token;

  constructor(Token _token_address) {
    token = _token_address;
  }

  function getLandPrice(uint _x, uint _y) public view returns(uint) {
    return landPrices[landHash(_x, _y)];
  }

  function setLandPrice(uint _x, uint _y, uint _newPrice) private {
    landPrices[landHash(_x, _y)] = _newPrice;
  }



  function getAllLandIds() external view returns(uint[] memory) {
    uint[] memory result = new uint[](lands.length);
    for (uint i = 0; i < lands.length; i++) {
      result[i] = i;
    }
    return result;
  }

  function getLandsByOwner(address _owner) external view returns(uint[] memory) {
    uint[] memory result = new uint[](ownedLandCount[_owner]);
    uint counter = 0;
    for (uint i = 0; i < lands.length; i++) {
      // this function makes VM invlid opcode error if not using the wierd casting
      if (address(uint160(landToOwner[i])) == _owner) {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }

  function getLandIdByCoord(uint _x, uint _y) public view returns(uint, bool) {
    uint landId;
    bool exists = false;
    for (uint i = 0; i < lands.length; i++) {
      if (lands[i].x == _x && lands[i].y == _y) {
        landId = i;
        exists = true;
        break;
      }
    }
    return (landId, exists);
  }



  function landHash(uint _x, uint _y) public pure returns(bytes32) {
    return keccak256(abi.encodePacked(_x, _y));
  }

  modifier ownedLand(uint _x, uint _y) {
    bytes32 targetLandHash = landHash(_x, _y);
    require(landPrices[targetLandHash] > 0, "land is not owned by anyone");
    _;
  }

  modifier unownedLand(uint _x, uint _y) {
    bytes32 targetLandHash = landHash(_x, _y);
    require(landPrices[targetLandHash] == 0, "land is already owned");
    _;
  }



  function claimLand(uint _x, uint _y) payable external unownedLand(_x, _y) {
    // create land
    Land memory targetLand = Land(_x, _y);
    lands.push(targetLand);

    // assign owner
    uint _landId = lands.length - 1;
    landToOwner[_landId] = msg.sender;

    // assign price
    bytes32 targetLandHash = landHash(_x, _y);
    landPrices[targetLandHash] = msg.value;

    // increase owner land count
    ownedLandCount[msg.sender]++;

    emit LandClaimed(_x, _y, msg.sender, msg.value);
  }

  function seizeLand(uint _x, uint _y) payable external ownedLand(_x, _y) {
    // must be more expensive
    uint oldPrice = getLandPrice(_x, _y);
    require(msg.value > oldPrice, "must buy for more than the previous land price");
    
    // must exist (actually a redundant check after ownedLand) and get the id
    uint landId;
    bool exists;
    (landId, exists) = getLandIdByCoord(_x, _y);
    require(exists, "land isn't owned by anyone, go claim it instead");

    // get old owner
    address payable oldOwner = address(uint160(landToOwner[landId])); // wierd workaround typecast

    // refund the old owner a fraction of the price they originally paid
    oldOwner.transfer(oldPrice * 90/100);

    // change ownership to new owner
    landToOwner[landId] = msg.sender;
    ownedLandCount[msg.sender]++;
    ownedLandCount[oldOwner]--;
    // update the new land price
    setLandPrice(_x, _y, msg.value);
    
    emit LandSeized(_x, _y, oldOwner, msg.sender, oldPrice, msg.value);
  }



}