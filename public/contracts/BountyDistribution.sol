pragma solidity ^0.4.21;

contract BountyDistribution {
    // only employees may alter
    modifier onlyMembers {
        //require(membership[msg.sender]); 
        _;
    }

    event QuestionCreated(address indexed _address, uint256 qHash); 

    // Congress Variables/Structs
    mapping (address => bool) membership; 
    mapping (address => MemberProposal) addProposals; 
    mapping (address => MemberProposal) removeProposals; 

    uint numMembers; 
    uint debatingPeriodInMinutes = 600; 

    struct MemberProposal { 
        address proposedMember; 
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
        Answer[] answers;
        mapping(uint256 => uint256) indexes; 
        uint minExecutionDate; 

        uint numAnswers; 
        bool settled;
        bool isValue; // checks for existence of key
    }

    struct Answer {
        address answererAddr; 
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
    function newProposal(address proposedMember, bool addAddress) onlyMembers public {
        if (addAddress) {
            require(!addProposals[proposedMember].isValid || !addProposals[proposedMember].open);
            addProposals[proposedMember] = MemberProposal({
                proposedMember: proposedMember,
                minExecutionDate: now + debatingPeriodInMinutes * 1 minutes,
                numberOfVotes: 0,
                currentResult: 0,
                open: true,
                isValid: true
            });
        } else {
            require(!removeProposals[proposedMember].isValid || !removeProposals[proposedMember].open);
            removeProposals[proposedMember] = MemberProposal({
                proposedMember: proposedMember,
                minExecutionDate: now + debatingPeriodInMinutes * 1 minutes,
                numberOfVotes: 0,
                currentResult: 0,
                open: true,
                isValid: true
            });
        }
    }

    function voteOnMembership(address proposedMember, bool add, bool support) onlyMembers public {
        MemberProposal storage p; 
        if (add) { 
            p = addProposals[proposedMember];
        } else {
            p = removeProposals[proposedMember]; 
        }
        require (p.isValid); 

        require(!p.voted[msg.sender]);

        p.voted[msg.sender] = true; 
        p.numberOfVotes++; 
        if (support) {
            p.currentResult++; 
        } else {
            p.currentResult--; 
        }
    }

    function executeProposal(address proposedMember, bool add) public {
        MemberProposal storage p; 
        if (add) { 
            p = addProposals[proposedMember];
        } else {
            p = removeProposals[proposedMember]; 
        }
        require (p.isValid && now > p.minExecutionDate && p.open); 

        p.open = false; 

        if (p.currentResult > 0 && add) {
            // add member
            membership[p.proposedMember] = true; 
            numMembers++; 
        } else if (p.currentResult > 0 && !add) {
            membership[p.proposedMember] = false; 
            numMembers--; 
        }
    }

    // Q&A Functions
    function addAnswer(uint256 qHash, uint256 aHash) onlyMembers public {
        require(questions[qHash].isValue && !questions[qHash].settled);
        questions[qHash].answers.push(Answer({
            answererAddr: msg.sender,
            answerHash: aHash,
            numUpvotes: 0,
            isValue: true
        }));
        questions[qHash].indexes[aHash] = questions[qHash].numAnswers; 
        questions[qHash].numAnswers++; 
    }

    function addAnswerUpvote(uint256 _qHash, uint256 _aHash) onlyMembers public { 
        require(questions[_qHash].isValue && !questions[_qHash].settled);

        uint256 idx = questions[_qHash].indexes[_aHash]; 
        require(questions[_qHash].answers[idx].isValue && !questions[_qHash].answers[idx].voted[msg.sender]);

        questions[_qHash].answers[idx].numUpvotes++; 
        questions[_qHash].answers[idx].voted[msg.sender] = true; 
    }

    function distributeBounty(uint256 _qHash) onlyMembers public {
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        //require(now > questions[_qHash].minExecutionDate); 

        msg.sender.transfer(questions[_qHash].bounty); 

        /*

        if (questions[_qHash].numAnswers == 0) {
            refundBounty(_qHash); 
        } else {
            address highestAddress = questions[_qHash].answers[0].answererAddr; 
            uint numUpvotes = questions[_qHash].answers[0].numUpvotes;

            for(uint i = 1; i < questions[_qHash].numAnswers; i++)
            {
                if (questions[_qHash].answers[i].numUpvotes > numUpvotes) { 
                    highestAddress = questions[_qHash].answers[i].answererAddr; 
                    numUpvotes = questions[_qHash].answers[i].numUpvotes; 
                }
            }  
            highestAddress.transfer(questions[_qHash].bounty);
            questions[_qHash].settled = true;
        }*/
    }

    function refundBounty(uint256 _qHash) private {
        require(questions[_qHash].isValue && !questions[_qHash].settled);
        questions[_qHash].askerAddr.transfer(questions[_qHash].bounty);
        questions[_qHash].settled = true;
        // should we set answerHash to something?
    }

    function collectBounty(uint256 _qHash, uint minExecutionDate) onlyMembers public payable {
        // can also use msg.sender and msg.value
        // who controls whether bounty == msg.value
        //require(msg.value >= _bounty);
        
        questions[_qHash].hash = _qHash; 
        questions[_qHash].bounty = msg.value; 
        questions[_qHash].askerAddr = msg.sender; 
        questions[_qHash].settled = false;
        questions[_qHash].isValue = true; 
        questions[_qHash].numAnswers = 0; 
        questions[_qHash].minExecutionDate = minExecutionDate; 

        emit QuestionCreated(msg.sender, _qHash); 
        
    }

    function get(uint256 q_hash) view public returns (uint256 bounty, address askerAddr) {
        return (questions[q_hash].bounty, questions[q_hash].askerAddr); 
    }

    // kill function?
    // fallback function?
    // msg.value --> how much ether was spent in making this call
    // error handling with whether or not questions[_qHash] exists
    // state is required or else refunds can be manipulated
}
