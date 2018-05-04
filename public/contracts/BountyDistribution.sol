pragma solidity ^0.4.21;

contract BountyDistribution {
	mapping (address => uint256) public balances;
	address contractCreator; 

	function BountyDistribution() public {
		contractCreator = msg.sender;
	}

	function payBounty(address _to, uint256 _value) public returns (bool success) {
		
	}

	function balanceOf(address _owner) public view returns (uint256 balance) {
		return balances[_owner];
	}
}
