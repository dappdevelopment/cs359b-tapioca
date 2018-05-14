// anonymous, self-invoking function to limit scope
(function() {
  var MainView = {};

  MainView.render = function($body) {
    NewsfeedView.render($body.find('#questions_list'));
    //SearchView.render($body.find('#search'));
  };


  if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?'; 

  web3 = new Web3(web3.currentProvider); 
  console.log("Using web3 version: " + Web3.version); 

  var contract; 
  var userAccount; 

  //var contractDataPromise = $.getJSON('CardinalToken.json'); 
  var networkIdPromise = web3.eth.net.getId(); 
  var accountsPromise = web3.eth.getAccounts(); 

  Promise.all([networkIdPromise, accountsPromise])
        .then(function initApp(results){
    var accounts = results[1]; 
    var userAccount = accounts[0]; 
  	MainView.user_id = userAccount; 
  	console.log("accounts: " + accounts)
  })

  window.MainView = MainView; 
})();

function openModal() { 
	console.log("opening modal")
	$("#add_container").css("display", "block");
}

function closeModal() { 
	$("#add_container").css("display", "none");
}

