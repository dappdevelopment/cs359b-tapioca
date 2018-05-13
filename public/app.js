var express = require('express');
var bodyParser = require('body-parser');

var STATUS_USER_ERROR = 422
var STATUS_OK = 200
var NUM_QUERIES = 3

// connect to database
//mongoose.connect('mongodb://localhost:27017/callback-newsfeed-db');

var app = express();

var model = require('./app/js/model');

// parse json bodies in post requests
app.use(bodyParser.json());

// serve all files out of public folder
app.use(express.static(__dirname + '/app'));

var path = require("path");

/*app.get('/', function(request, response) { 
  console.log("/GET index")
  response.sendFile('/index.html');
})*/

app.get('/question_feed', function(request, response) {
  console.log("/GET question_feed")
	var query = request.query.q

	var data = { 
    questions: [
		{
      id: "f02j90r3i0k023jr",
      title: "Max is Cool",
      content: "I have a question please answer",
      bounty: 60,
      user_id: "max",
      upvotes: 100,
      answers: [
        {
          text: "Hello world",
          user_id: "max_imaginary_gf",
          upvotes: 5
        },
        {
          text: "Hello max",
          user_id: "claire",
          upvotes: 2
        }, 
      ]
    },
    {
      id: "f02j90r3i0k023jr",
      title: "Peter is Cool",
      content: "Hi hi hi hi",
      bounty: 50,
      user_id: "varun",
      upvotes: 1000,
      answers: [
        {
          text: "Chickens",
          user_id: "alex_lee",
          upvotes: 4
        },
        {
          text: "Cats",
          user_id: "maddie_wang",
          upvotes: 8
        }, 
      ]
    }
   ]
  }

	response.set('Content-type', 'application/json')
	response.status(STATUS_OK) 
	response.send(JSON.stringify(data))
})

app.get('/question_detail', function(request, response)  {
  var q_id = request.query.q_id 
  console.log("GET /questions_detail " + q_id) 

  var data = {
    q_data: 
    {
        id: "f02j90r3i0k023jr",
        title: "Max is Cool",
        content: "I have a question please answer",
        bounty: 60,
        user_id: "max",
        upvotes: 100,
        answers: [
          {
            text: "Friends, Romans, countrymen, lend me your ears;I come to bury Caesar, not to praise him. The evil that men do lives after them; The good is oft interrèd with their bones. So let it be with Caesar. The noble Brutus Hath told you Caesar was ambitious. If it were so, it was a grievous fault, And grievously hath Caesar answered it [1].Here under leave of Brutus and the rest(For Brutus is an honorable man;So are they all, all honorable men), Come I to speak in Caesar's funeral.",
            user_id: "max_imaginary_gf",
            upvotes: 5,
            id: "panckaes_and_berta"
          },
          {
            text: "Hello max",
            user_id: "claire",
            upvotes: 2,
            id: "sleep"
          }, 
        ]
    }
  }

  response.set('Content-type', 'application/json')
  response.status(STATUS_OK) 
  response.send(JSON.stringify(data))
});

<<<<<<< HEAD
app.post('/submit_question', function(request, response) {
  console.log("question submit");
  console.log(request.body);
});
=======
app.post('/upvote', function(request, response) {
  console.log("POST /upvotes " + "question_ID: " + request.body.question_id + "; answer_ID: " + request.body.answer_id)
  console.log("upvoting")
>>>>>>> f79eb0d5edef07c9c61cac966a2356ca0247a5c8

  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send();
})

app.post('/add_answer', function(request, response) {
  console.log("POST /add_answer " + "question_ID: " + request.body.question_id + "; answer: " + request.body.text)

  response.set('Content-type', 'application/json');
  response.status(STATUS_OK);
  response.send();
})

app.listen(3000);
console.log('Listening at 127.0.0.1:' + 3000);

async function test() {
  await model.resetDB();
  let askerId = await model.createUser("mchang4", "0xwiofjeojo023kr03");
  let answererId = await model.createUser("peterlu6", "0x29040g3hfej322ri");
  let user3 = await model.createUser("sclaire", "0x0932r09j24023r");
  let questionId = await model.createQuestion(50, "hash goes here", new Date("2016-12-12"), "title", "body", askerId);
  let answerId = await model.createAnswer(answererId, questionId);
  let retrievedQuestion = await model.findQuestion(questionId);
  let retrievedAnswer = await model.findAnswer(answerId);
  let retrievedUser = await model.findUser(askerId);
  console.log(retrievedQuestion);
  console.log(retrievedAnswer);
  console.log(retrievedUser);
  await model.upvoteAnswer(answerId, user3);
}


test();

