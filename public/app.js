var contract = require('./app/build/contracts/BountyDistribution.json')

var express = require('express');
var bodyParser = require('body-parser');
var ObjectId = require('mongoose').Types.ObjectId;

const privateKey = Buffer.from('dd298dcb456d677efb42d1b865acf532789c7b948d8db8901918045ae684ac10', 'hex')



var STATUS_USER_ERROR = 422
var STATUS_OK = 200
var NUM_QUERIES = 3

var sha256 = require('js-sha256').sha256;
var Web3 = require('web3')

// connect to database
//mongoose.connect('mongodb://localhost:27017/callback-newsfeed-db');

var app = express();

var model = require('./app/js/model');

// parse json bodies in post requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// serve all files out of public folder
app.use(express.static(__dirname + '/app'));

var path = require("path");

/*app.get('/', function(request, response) { 
  console.log("/GET index")
  response.sendFile('/index.html');
})*/

app.get('/question_feed', async function(request, response) {
  console.log("/GET question_feed")

  let questions = await model.findQuestionFeedData();

	response.set('Content-type', 'application/json');
	response.status(STATUS_OK);
	response.send(JSON.stringify(questions));
});

app.get('/my_answers_feed', async function(request, response) {
  console.log("/GET my_answers_feed")

  let questions_answered = await model.findQuestionsAnswered(request.query.user_addr); 

  console.log("questions_answered: " + JSON.stringify(questions_answered));

	response.set('Content-type', 'application/json');
	response.status(STATUS_OK);
	response.send(JSON.stringify(questions_answered));
});

app.get('/question_hash', async function(request, response) {
  console.log("/GET question_hash " + request);
  let q_summary = request.query.summary;
  let q_hash = sha256(q_summary);
  let data = {
    q_hash: q_hash
  };
  response.send(JSON.stringify(data));
});

app.get('/question_detail', async function(request, response)  {
  var q_id = request.query.q_id 
  console.log("GET /questions_detail " + q_id) 
  let question_data = await model.findQuestionData(q_id);

  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send(JSON.stringify(question_data));
});

app.post('/submit_question', async function(request, response) {
  console.log(request.body);
  console.log("POST /submit_question", "title: " + request.body.title, "details: " + request.body.details, 
    "asker_addr: " + request.body.asker_addr, "bounty: " + request.body.bounty);

  if (!global.contract) {
    return response.status(400).send({
       message: 'Server-Side Error; Please try again later.'
    });
  }

  let result = global.contract.methods.get(web3.utils.toBN(request.body.q_hash)).call({from: '0x418511304598Ad3426D389395B03cbBCA24B0d29'}).then(function(result, error) {
    console.log("callback1")
    if (!error) {
      console.log("callback2")
      if (result.bounty == request.body.bounty && result.askerAddr == request.body.asker_addr) {
        let bounty = Number(request.body.bounty);
        let asker_addr = request.body.asker_addr;
        console.log("callback5")
        model.createQuestion(bounty, request.body.time_exp_days, request.body.time_exp_hours, request.body.time_exp_minutes, request.body.title, request.body.details, asker_addr).then(function(returnData, error) {
          if (error) {
            console.error(error); 
          }
          console.log("callback me")
          response.set('Content-type', 'application/json');
          response.status(STATUS_OK);
          console.log("qhash: " + returnData.questionHash); 
          data = {
            qHash: returnData.questionHash
          }
          console.log("Successfully sent back result.")
          response.send(JSON.stringify(data));
        })
      } else {
        console.log("callback3")
        response.status(400).send({message: "Nice Try; hehehe"}); 
      }
    } else {
      console.log("updated")
      console.error(error)
      console.log("callback4")
      response.status(400).send({message: "Error Retrieving Data"}); 
    }
  });

  /* Don't delete this comment because if I have to rewrite this shit, I may have to kill someone 
  const functionAbi = global.contract.methods.get(web3.utils.toBN(request.body.q_hash)).encodeABI(); 
  var number = await web3.eth.getTransactionCount("0x418511304598Ad3426D389395B03cbBCA24B0d29");

  const txParams = {
    nonce: number,
    to: global.contract.address, 
    data: functionAbi
  }

  const tx = new Tx(txParams); 
  tx.sign(privateKey); 
  const serializedTx = tx.serialize(); 
  web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', console.log)*/

  /*.then(async function(x) {
    console.log(x); 
    let bounty = Number(request.body.bounty);
    let asker_addr = request.body.asker_addr;

    let returnData = await model.createQuestion(bounty, request.body.time_exp_days, request.body.time_exp_hours, request.body.time_exp_minutes, request.body.title, request.body.details, asker_addr);

    response.set('Content-type', 'application/json');
    response.status(STATUS_OK);
    console.log("qhash: " + returnData.questionHash); 
    data = {
      qHash: returnData.questionHash
    }
    response.send(JSON.stringify(data));
  })*/
});

app.get('/member_proposals', async function(request, response) {
  console.log("/GET member_propsals")

  let proposals = await model.findOpenProposals(); 

  response.set('Content-type', 'application/json');
	response.status(STATUS_OK);
	response.send(JSON.stringify(proposals));
});

app.post('/create_proposal', function(request, response) {
  console.log("POST /create_proposal " + "proposing_user_addr: " + request.body.proposing_user_addr + " more stuff");
  let proposing_user_addr = request.body.proposing_user_addr;
  let proposed_user_addr = request.body.proposed_user_addr;
  let is_add_proposal = request.body.is_add_proposal;
  model.createProposal(proposing_user_addr, proposed_user_addr, is_add_proposal);
  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send();
})

app.post('/upvote_proposal', function(request, response) {
  console.log("POST /upvote_proposal " + "user_addr: " + request.body.user_addr + "; post_ID: " + request.body.post_id);
  let post_id = ObjectId(request.body.post_id);
  let user_addr = request.body.user_addr;
  model.voteOnProposal(post_id, true, user_addr);
  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send();
})

app.post('/downvote_proposal', function(request, response) {
  console.log("POST /upvote_proposal " + "user_addr: " + request.body.user_addr + "; post_ID: " + request.body.post_id);
  let post_id = ObjectId(request.body.post_id);
  let user_addr = request.body.user_addr;
  model.voteOnProposal(post_id, false, user_addr);
  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send();
})

app.post('/add_answer', function(request, response) {
  console.log("POST /add_answer "  + "question_ID: " + request.body.question_id + "; answer: " + request.body.text)
  let question_id = ObjectId(request.body.question_id);
  model.createAnswer(request.body.user_addr, question_id, request.body.text);
  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send();
})

app.post('/create_user', function(request, response) {
  console.log("POST /create_user " + "user_ID: " + request.body.user_id + "; asker_address: " + request.body.asker_address);
  model.createUser(request.body.user_id, request.body.asker_address);
  response.set('Content-type', 'application/json');
  response.status(STATUS_OK); 
  response.send()
})

app.listen(process.env.PORT || 3000);
console.log('Listening at 127.0.0.1:' + 3000);

async function clearDB() {
  await model.resetDB();
}

async function initDB() {
  let askerAddr = await model.createUser("mchang4", "0x66FDDd026Dbf64D6F907154365113ae124eB2DD6");
  let answererAddr = await model.createUser("peterlu6", "0xd08923976D510F8f834E1B8BC4E1c03599F2644F");
  let returnData = await model.createQuestion(50, 10, 1, 23, "how do i make friends", "i have no friends", askerAddr);
  let answerObject = await model.createAnswer(answererAddr, returnData.questionId, "plastic surgery");
  // await model.markQuestionClosed(returnData.questionId);
  let memberList = await model.initializeMemberList(); // This must be called if the DB is cleared.
}

async function test() {
  await clearDB();
  await initDB();
}


async function connectToEthereum() { 
  //web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/hzinmOiPQJ95bFyblv1K "));
  web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:8545"));
  var networkId = await web3.eth.net.getId(); // resolves on the current network id

  var contractData = contract;       
  // Make sure the contract is deployed on the connected network
  if (!(networkId in contractData.networks)) {
    throw new Error("Contract not found in selected Ethereum network.");
  }

  contractAddress = contractData.networks[networkId].address;
  global.contract = new web3.eth.Contract(contractData.abi, contractAddress);
  

  switch(networkId) { 
      case 1: 
          networkURI = 'wss://mainnet.infura.io/ws'; 
          break;
      case 4: 
          networkURI = 'wss://rinkeby.infura.io/ws'; 
          break;
      default:
          networkURI = 'ws://localhost:8545';
          break;
  }
  
  const web3ForEvents = new Web3(new Web3.providers.WebsocketProvider(networkURI)); 
  const contractForEvents = new web3ForEvents.eth.Contract(contractData.abi, global.contract._address ); 

  contractForEvents.events.QuestionCreated()
  .on("data", function(event) { 
      let data = event.returnValues;
      console.log("Question Successfully Created"); 
  })

  /*
  const web3Events = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws'));

  const subscription = web3Events.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
    if (error) return console.error(error);

    console.log('Successfully subscribed!', blockHeader);
  }).on('data', (blockHeader) => {
    console.log('data: ', blockHeader);
  });*/
}

test();

connectToEthereum(); 
