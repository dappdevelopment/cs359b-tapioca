function app() {
 	/* Displays health check to see if metamask is correctly read */
	console.log("health check up")
	if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
	web3 = new Web3(web3.currentProvider); // MetaMask injected Ethereum provider
    console.log("Using web3 version: " + Web3.version); // why doesn't this work
    console.log(web3.version)

    var contract;
    var userAccount;
  
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
            
            // Make sure the contract is deployed on the connected network
            if (!(networkId in contractData.networks)) {
                throw new Error("Contract not found in selected Ethereum network on MetaMask.");
            }

            var contractAddress = contractData.networks[networkId].address;
            contract = new web3.eth.Contract(contractData.abi, contractAddress);
        }).catch(console.error);
        // Refresh balance instead of printing to the console
        // .then(refreshBalance)
        // .catch(console.error);
        // function refreshBalance() { // Returns web3's PromiEvent
        //     // Calling the contract (try with/without declaring view)
        //     contract.methods.balanceOf(userAccount).call().then(function (balance) {
        //         $('#display').text(balance + " CDT");
        //         $("#loader").hide();
        //     })
        // }


    function collectBounty() {
        contract.methods.collectBounty(asker, qHash, bounty).send({from: userAccount})
            .then(refreshPage)
            .catch(function (e) {
                // catch things here
            })
    }

    $("#link-to-metamask").click(function() {
        localStorage.setItem('userAccount', userAccount);
        console.log("userAccount in metamask.js click function:" + userAccount); 
    })
}

$(document).ready(app);

// module.exports.setUpMetamask = setUpMetamask;
// module.exports.userAccount = userAccount; 

