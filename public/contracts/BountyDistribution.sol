pragma solidity ^0.4.21;

contract BountyDistribution {

    modifier onlyMembers {
        require(membership[msg.sender] != 0); 
        _;
    }

    // Congress Variables
    address[] members; 
    mapping (address => uint) membership; 
    MemberProposal[] proposals; 
    uint numMembers; 
    uint debatingPeriodInMinutes = 10; 

    struct MemberProposal { 
        address recipient; 
        uint minExecutionDate; 
        uint numberOfVotes; 
        bool addAddress;
        int currentResult; 
        bool open; 
        
        mapping (address => bool) voted; 
    }

    function newProposal(address recipient, bool addAddress) onlyMembers public returns (uint) {
        MemberProposal storage p = proposals[proposals.length]; 
        p.recipient = recipient; 
        p.minExecutionDate = now + debatingPeriodInMinutes * 1 minutes; 
        p.numberOfVotes = 0; 
        p.addAddress = addAddress; 
        p.open = true; 

        return proposals.length; 
    }

    function vote(uint proposalNumber, bool support) onlyMembers public {
        MemberProposal storage p = proposals[proposalNumber]; 
        require(!p.voted[msg.sender]); 
        p.numberOfVotes++; 
        if (support) {
            p.currentResult++; 
        } else {
            p.currentResult--; 
        }
    }

    function executeProposal(uint proposalNumber) public {
        MemberProposal storage p = proposals[proposalNumber]; 
        require(now > p.minExecutionDate && p.open); 

        p.open = false; 

        if (p.currentResult > 0 && p.addAddress) {
            // add member
            membership[p.recipient] = 1; 
            numMembers++; 
        } else if (p.currentResult > 0 && !p.addAddress) {
            membership[p.recipient] = 0; 
            numMembers--; 
        }
    }

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
