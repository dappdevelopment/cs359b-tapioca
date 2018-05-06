// anonymous, self-invoking function to limit scope
(function() {
 	/* Displays health check to see if metamask is correctly read */
	console.log("health check up")
	if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
	web3 = new Web3(web3.currentProvider); // MetaMask injected Ethereum provider
    console.log("Using web3 version: " + Web3.version);
    console.log(web3.version)

})();
