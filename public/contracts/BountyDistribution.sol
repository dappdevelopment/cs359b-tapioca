pragma solidity ^0.4.21;

contract BountyDistribution {
    struct Question {
        uint256 hash;
        uint256 bounty;
        address askerAddr;
        uint256 answerHash;
    }

    mapping (uint256 => Question) public questions;
    address contractCreator;

    function BountyDistribution() public { // constructor
        contractCreator = msg.sender;
    }

    function distributeBounty(address _answerer, uint256 _aHash, uint256 _qHash) public {
        Question storage q = questions[_qHash];
        _answerer.transfer(q.bounty);
        q.answerHash = _aHash;
    }

    function refundBounty(uint256 _qHash) public {
        Question storage q = questions[_qHash];
        q.askerAddr.transfer(q.bounty);
        // should we set answerHash to something?
    }

    function collectBounty(address _asker, uint256 _qHash, uint256 _bounty) public payable {
        // can also use msg.sender and msg.value
        // who controls whether bounty == msg.value
        require(msg.value >= _bounty);
        questions[_qHash] = Question({hash: _qHash, bounty: _bounty, askerAddr: _asker, answerHash: 0}); // there's no null
    }

    // kill function?
    // fallback function?
    // msg.value --> how much ether was spent in making this call
    // error handling with whether or not questions[_qHash] exists
}
