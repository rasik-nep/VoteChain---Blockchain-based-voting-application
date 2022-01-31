pragma solidity >=0.5.16;

// SPDX-License-Identifier: MIT
contract Election {
    //model a candiate
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }
    //strore accounts thathave voted
    mapping(address => bool) public voters;
    //store candidate
    //fetch candidate
    //using mapping (associative array or hash where er associate key value pairs)
    // key=>uint    value=>candiate
    // we are writing to the blockchain by changing the state of the contract
    mapping(uint256 => Candidate) public candidates;

    //store vote of candidate
    uint256 public candidatesCount = 0;

    //private because we donot want others to add candiate to the mapping
    // first run this function
    constructor() public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    // //voters mapping
    // mapping(address => bool) public voters;

    //votedEvent defined
    event votedEvent(uint256 indexed _candidateId);

    //Election1();
    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    //voting function
    //solidity allows to pass metadata to the function (account which is voting)

    function vote(uint256 _candidateId) public {
        // require that they haven't voted before
        //require that the current address is not in the mapping
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}
