# Tapioca: Employee feedback: democratized.

Tapioca is an internal QA platform enabling honest and transparent discussion among employees of a company.

## Motivation
Employee feedback is critical to maintaining the success of a company. Managers who receive feedback on their strengths show 9% higher profitability, and over $74 billion was spent on employee engagement products in 2016. Studies have shown that companies with higher engagement are more productive, safer, and have lower turnover. 

However, as data collection and censorship continues to expand, employees feel less and less safe voicing their honest concerns about the direction of a company. 

Tapioca harnesses the power of the blockchain to create an open and transparent communication channel between employees and managers in an organization.

## Functionality
On the Tapioca platform, you can:
1. Create questions and set bounty for these questions.
2. Submit answers for existing questions and collect bounty for top answers.
3. Create proposals to add or remove members from the DAO.
4. Vote on proposals to add or remove members from the DAO.

## Implementation
There are four aspects to the application: the front-end, the MongoDB database, the server, and the contract deployed on the blockchain. The way these components interact is best described through each of the use cases.

1. Creating and answering questions.
Creating questions causes the front-end to make a call to the Solidity contract, which will validate that the user has sufficient ETH in their account to afford posting of the question. This will then cause the front-end to make an API call to the server that will store the newly made question to the database with a set expiration time. The question is also posted to the blockchain with its expiration time.

Upon termination of the expiration time, the user can request the bounty reward from the blockchain, which will distribute the bounty to the top user.


2. Creating and voting on member proposals.
The DAO has been implemented in the solidity contract, but currently the DAO interface is supported by the centralized server without validation against the blockchain. Upon termination of a particular member proposal, the server will check the result of the proposal, and either add or remove that member from the stored validated member list.

The upvotes, question data, and answer data are stored on the chain. Currently, the member proposals and voting are stored off chain, although the infrastructure to store on chain exists in the contract.


## Installation intructions

Download the repo, navigate to the public/ folder, and run `node app.js`. Then, navigate to 127.0.0.1:3000 to use the application. Alternatively, a version of the application is deployed at tapioca-dapp.herokuapp.com.
