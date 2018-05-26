pragma solidity ^0.4.21;

contract BountyDistribution {

    modifier onlyMembers {
        require(membership[msg.sender]); 
        _;
    }

    // Congress Variables
    address[] members; 
    mapping (address => bool) membership; 
    mapping (address => MemberProposal) addProposals; 
    mapping (address => MemberProposal) removeProposals; 

    uint numMembers; 
    uint debatingPeriodInMinutes = 10; 

    struct MemberProposal { 
        address recipient; 
        uint minExecutionDate; 
        uint numberOfVotes; 
        int currentResult; 
        bool open; 
        bool isValid;
        
        mapping (address => bool) voted; 
    }

    function newProposal(address recipient, bool addAddress) onlyMembers public {
        if (addAddress) {
            require(!addProposals[recipient].isValid || !addProposals[recipient].open);
        } else {
            require(!removeProposals[recipient].isValid || !removeProposals[recipient].open);
        }

        if (addAddress) { 
            addProposals[recipient] = MemberProposal({
                recipient: recipient, 
                minExecutionDate: now + debatingPeriodInMinutes * 1 minutes, 
                numberOfVotes: 0, 
                currentResult: 0,
                open: true, 
                isValid: true
            });
        } else {
            removeProposals[recipient] = MemberProposal({
                recipient: recipient, 
                minExecutionDate: now + debatingPeriodInMinutes * 1 minutes, 
                numberOfVotes: 0, 
                currentResult: 0,
                open: true, 
                isValid: true
            });
        }
    }

    function vote(address recipient, bool add, bool support) onlyMembers public {
        MemberProposal storage p; 
        if (add) { 
            p = addProposals[recipient];
        } else {
            p = removeProposals[recipient]; 
        }
        require (p.isValid); 

        require(!p.voted[msg.sender]); 
        p.numberOfVotes++; 
        if (support) {
            p.currentResult++; 
        } else {
            p.currentResult--; 
        }
    }

    function executeProposal(address recipient, bool add) public {
        MemberProposal storage p; 
        if (add) { 
            p = addProposals[recipient];
        } else {
            p = removeProposals[recipient]; 
        }
        require (p.isValid);  
        require(now > p.minExecutionDate && p.open); 

        p.open = false; 

        if (p.currentResult > 0 && add) {
            // add member
            membership[p.recipient] = true; 
            numMembers++; 
        } else if (p.currentResult > 0 && !add) {
            membership[p.recipient] = false; 
            numMembers--; 
        }
    }

    struct Question {
        uint256 hash;
        uint256 bounty; // denominated in WEI. 1 ether = 10^18 wei
        address askerAddr;
        mapping(uint256 => Answer) answers;
        bool settled;
        bool isValue; // checks for existence of key
    }

    struct Answer {
        address answerAddr; 
        uint256 answerHash; 
        
        uint256 numUpvotes; 
        bool isValue;
        mapping(address => bool) voted; 
    }

    mapping (uint256 => Question) public questions;
    address contractCreator;

    function BountyDistribution() public { // constructor
        contractCreator = msg.sender;
    }

    function addAnswer(uint256 _qHash, uint256 _aHash) public {
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        questions[_qHash].answers[_aHash] = Answer({
            answerAddr: msg.sender, 
            answerHash: _aHash, 
            numUpvotes: 0,
            isValue: true
        }); 
    }

    function addUpvote(uint256 _qHash, uint256 _aHash) public { 
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        require(questions[_qHash].answers[_aHash].isValue && !questions[_qHash].answers[_aHash].voted[msg.sender]);

        questions[_qHash].answers[_aHash].numUpvotes++; 
        questions[_qHash].answers[_aHash].voted[msg.sender] = true; 
    }

    function distributeBounty(address _answerer, uint256 _aHash, uint256 _qHash) public {
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        _answerer.transfer(questions[_qHash].bounty);
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
            isValue: true
        }); // there's no null
    }

    // kill function?
    // fallback function?
    // msg.value --> how much ether was spent in making this call
    // error handling with whether or not questions[_qHash] exists
    // state is required or else refunds can be manipulated
}
