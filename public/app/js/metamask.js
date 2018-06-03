function app() {
 	/* Displays health check to see if metamask is correctly read */
	console.log("health check up")
	if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
	web3 = new Web3(web3.currentProvider); // MetaMask injected Ethereum provider
    console.log("Using web3 version: " + Web3.version); // why doesn't this work
    console.log(web3.version)

    var contract;
    var userAccount;
    var contractAddress; 
  
    var contractDataPromise = $.getJSON('build/contracts/BountyDistribution.json');
    var networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
    var accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts

    Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
        .then(function initApp(results) {
            var contractData = results[0];  // resolved value of contractDataPromise
            var networkId = results[1];     // resolved value of networkIdPromise
            var accounts = results[2];      // resolved value of accountsPromise
            userAccount = accounts[0];
            console.log("printing userAccount in metamask.js: " + userAccount); 

            $("#user_address").html(userAccount);

            localStorage.setItem('userAccount', userAccount);

            var addPostRequest = new XMLHttpRequest();

            user_details = { 
                user_id: "pancakes", 
                asker_address: userAccount
            }

            addPostRequest.open('POST', '/create_user')
            addPostRequest.setRequestHeader('Content-type', 'application/json')
            addPostRequest.send(JSON.stringify(user_details));
            
            // Make sure the contract is deployed on the connected network
            if (!(networkId in contractData.networks)) {
                throw new Error("Contract not found in selected Ethereum network on MetaMask.");
            }

            contractAddress = contractData.networks[networkId].address;
            contract = new web3.eth.Contract(contractData.abi, contractAddress);
            contractEvents(contractData.abi, contractData.networks[networkId], userAccount); 
        }).catch(console.error);

    function refreshBalance() { 
        console.log("refreshed"); 
    }

    async function contractEvents(abi, networkId, userAccount) {
        console.log("Preparing for registration of contract events. ")
        switch(networkId) { 
            case 1: 
                networkURI = 'wss://mainnet.infura.io/ws'; 
            case 4: 
                networkURI = 'wss://rinkeby.infura.io/ws'; 
            default:
                networkURI = 'ws://localhost:8545';
        }
        console.log('Events Provider: ', networkURI); 

        const web3ForEvents = new Web3(new Web3.providers.WebsocketProvider(networkURI)); 
        const contractForEvents = new web3ForEvents.eth.Contract(abi, contract._address); 

        console.log("Events: " + contractForEvents.events);
        contractForEvents.events.QuestionCreated({filter: {_address: userAccount} })
        .on("data", function(event) { 
            let data = event.returnValues;
            NewsfeedView.uploadQuestion(data["qHash"]);
            console.log("Question Successfully Created"); 
        })
    }
    
    window.collectBounty = function (qHash, bounty, time, callback) {
        console.log("type: " + typeof qHash);
        console.log("collected bounty with qHash: " + qHash + " and bounty: " + bounty);
        contract.methods.collectBounty(web3.utils.toBN(qHash), time).send({from: userAccount, to: contractAddress, value: bounty})
            .then(callback)
            .catch(console.error);
        console.log("collected bounty")
    };

    window.distributeBounty = function (answerer, aHash, qHash) {
        console.log("distributing bounty with answerer: " + answerer + " aHash: " + aHash + " qHash: " + qHash);
        contract.methods.distributeBounty(answerer, aHash, qHash).send({from: userAccount})
            .then(refreshBalance)
            .catch(console.error);
    };

    $("#link-to-metamask").click(function() {
        console.log("userAccount in metamask.js click function:" + userAccount); 
        localStorage.setItem('userAccount', userAccount);
    });
}

$(document).ready(app);