pragma solidity ^0.4.21;

contract BountyDistribution {
    // only employees may alter
    modifier onlyMembers {
        require(membership[msg.sender]); 
        _;
    }

    // Congress Variables/Structs
    mapping (address => bool) membership; 
    mapping (address => MemberProposal) addProposals; 
    mapping (address => MemberProposal) removeProposals; 

    uint numMembers; 
    uint debatingPeriodInMinutes = 600; 

    struct MemberProposal { 
        address recipient; 
        uint minExecutionDate; 
        uint numberOfVotes; 
        int currentResult; 
        bool open; 
        bool isValid;
        
        mapping (address => bool) voted; 
    }

    // Q&A Variables/Structs
    struct Question {
        uint256 hash;
        uint256 bounty; // denominated in WEI. 1 ether = 10^18 wei
        address askerAddr;
        mapping(uint256 => Answer) answers;
        mapping(uint256 => uint256) indexes; 
        uint minExecutionDate; 

        uint numAnswers; 
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

    constructor() public {
        membership[msg.sender] = true; 
    }

    // Membership Functions
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

    // Q&A Functions
    function addAnswer(uint256 _qHash, uint256 _aHash) public {
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        questions[_qHash].answers[questions[_qHash].numAnswers] = Answer({
            answerAddr: msg.sender,
            answerHash: _aHash,
            numUpvotes: 0,
            isValue: true
        }); 
        questions[_qHash].indexes[_aHash] = questions[_qHash].numAnswers; 
        questions[_qHash].numAnswers++; 
    }

    function addUpvote(uint256 _qHash, uint256 _aHash) public { 
        require(questions[_qHash].isValue && !questions[_qHash].settled);

        uint256 idx = questions[_qHash].indexes[_aHash]; 
        require(questions[_qHash].answers[idx].isValue && !questions[_qHash].answers[idx].voted[msg.sender]);

        questions[_qHash].answers[idx].numUpvotes++; 
        questions[_qHash].answers[idx].voted[msg.sender] = true; 
    }

    function distributeBounty(uint256 _qHash) public {
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        require(now > questions[_qHash].minExecutionDate); 


        if (questions[_qHash].numAnswers == 0) {
            refundBounty(_qHash); 
        } else {
            address highestAddress = questions[_qHash].answers[0].answerAddr; 
            uint numUpvotes = questions[_qHash].answers[0].numUpvotes;

            for(uint i = 1; i < questions[_qHash].numAnswers; i++)
            {
                if (questions[_qHash].answers[i].numUpvotes > numUpvotes) { 
                    highestAddress = questions[_qHash].answers[i].answerAddr; 
                    numUpvotes = questions[_qHash].answers[i].numUpvotes; 
                }
            }  
            highestAddress.transfer(questions[_qHash].bounty);
            questions[_qHash].settled = true;
        }
    }

    function refundBounty(uint256 _qHash) private {
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        questions[_qHash].askerAddr.transfer(questions[_qHash].bounty);
        questions[_qHash].settled = true;
        // should we set answerHash to something?
    }

    function collectBounty(address _asker, uint256 _qHash, uint256 _bounty, uint minExecutionDate) public payable {
        // can also use msg.sender and msg.value
        // who controls whether bounty == msg.value
        require(msg.value >= _bounty);
        questions[_qHash] = Question({
            hash: _qHash,
            bounty: _bounty,
            askerAddr: _asker,
            settled: false,
            isValue: true,
            numAnswers: 0,
            minExecutionDate: minExecutionDate
        }); // there's no null
    }

    // kill function?
    // fallback function?
    // msg.value --> how much ether was spent in making this call
    // error handling with whether or not questions[_qHash] exists
    // state is required or else refunds can be manipulated
}
