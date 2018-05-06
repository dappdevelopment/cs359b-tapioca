pragma solidity ^0.4.21;

contract BountyDistribution {
    struct Question {
        uint256 hash;
        uint256 bounty; // denominated in WEI. 1 ether = 10^18 wei
        address askerAddr;
        uint256 answerHash;
        bool settled;
        bool isValue; // checks for existence of key
    }

    mapping (uint256 => Question) public questions;
    address contractCreator;

    function BountyDistribution() public { // constructor
        contractCreator = msg.sender;
    }

    function distributeBounty(address _answerer, uint256 _aHash, uint256 _qHash) public {
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        _answerer.transfer(questions[_qHash].bounty);
        questions[_qHash].answerHash = _aHash;
        questions[_qHash].settled = true;
    }

    function refundBounty(uint256 _qHash) public {
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        questions[_qHash].askerAddr.transfer(questions[_qHash].bounty);
        questions[_qHash].settled = true;
        // should we set answerHash to something?
    }

    function collectBounty(address _asker, uint256 _qHash, uint256 _bounty) public payable {
        // can also use msg.sender and msg.value
        // who controls whether bounty == msg.value
        require(msg.value >= _bounty);
        questions[_qHash] = Question({
            hash: _qHash,
            bounty: _bounty,
            askerAddr: _asker,
            settled: false,
            isValue: true,
            answerHash: 0}); // there's no null
    }

    // kill function?
    // fallback function?
    // msg.value --> how much ether was spent in making this call
    // error handling with whether or not questions[_qHash] exists
    // state is required or else refunds can be manipulated
}
