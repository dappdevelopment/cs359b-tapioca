var express = require('express');
var bodyParser = require('body-parser');
var ObjectId = require('mongoose').Types.ObjectId;


var STATUS_USER_ERROR = 422
var STATUS_OK = 200
var NUM_QUERIES = 3

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

	response.set('Content-type', 'application/json')
	response.status(STATUS_OK) 
	response.send(JSON.stringify(questions))
})

app.get('/question_detail', async function(request, response)  {
  var q_id = request.query.q_id 
  console.log("GET /questions_detail " + q_id) 
  let question_data = await model.findQuestionData(q_id);

  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send(JSON.stringify(question_data));
});

app.post('/submit_question', function(request, response) {
  console.log("POST /submit_question", "title: " + request.body.title, "details: " + request.body.details, 
    "user_id: " + request.body.user_id, "bounty: " + request.body.bounty);
  let bounty = Number(request.body.bounty);
  let placeholder_id = ObjectId("73b312067720199e377e6fb9"); // random 24 digit hex string
  model.createQuestion(bounty, request.body.time_exp, request.body.title, request.body.details, placeholder_id);

  //needs some logic around enough money 

  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send();
});

app.post('/upvote', function(request, response) {
  console.log("POST /upvotes " + "user_ID: " + request.body.user_id + "; answer_ID: " + request.body.answer_id);
  let answer_id = ObjectId(request.body.answer_id);
  let user_id = ObjectId(request.body.user_id);
  model.upvoteAnswer(answer_id, user_id);
  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send();
})

app.post('/add_answer', function(request, response) {
  console.log("POST /add_answer " + "question_ID: " + request.body.question_id + "; answer: " + request.body.text)
  let placeholder_id = ObjectId("915bed12d3704298d62224fe");
  let question_id = ObjectId(request.body.question_id);
  model.createAnswer(placeholder_id, question_id, request.body.text);
  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send();
})

app.listen(3000);
console.log('Listening at 127.0.0.1:' + 3000);

async function clearDB() {
  await model.resetDB();
}

async function initDB() {
  let askerId = await model.createUser("mchang4", "0xwiofjeojo023kr03");
  let answererId = await model.createUser("peterlu6", "0x29040g3hfej322ri");
  let questionId = await model.createQuestion(50, new Date("2016-12-12"), "how do i make friends", "i have no friends", askerId);
  let answerId = await model.createAnswer(answererId, questionId, "plastic surgery");
}

async function test() {
  await clearDB();
  await initDB();
}

test();

