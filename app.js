var express = require('express');
var bodyParser = require('body-parser');

var STATUS_USER_ERROR = 422
var STATUS_OK = 200
var NUM_QUERIES = 3

// connect to database
//mongoose.connect('mongodb://localhost:27017/callback-newsfeed-db');

var app = express();

// parse json bodies in post requests
app.use(bodyParser.json());

// serve all files out of public folder
app.use(express.static('public'));



var path = require("path");

app.get('/', function(request, response) { 
    response.sendFile(path.join(__dirname + '/public/app/index.html'));
})


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



app.listen(3000);
console.log('Listening at 127.0.0.1:' + 3000);
