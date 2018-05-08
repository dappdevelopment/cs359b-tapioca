var mongoose = require('mongoose');

var schema = require('./schema');

var uristring = process.env.MONGODB_URI || "mongodb://localhost:27017/tapioca";

mongoose.connect(uristring, function (err, res) {
    if (err) {
      	console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
      	console.log ('Successfully connected to: ' + uristring);
    }
});

var createUser = function(username, address) {
	var createdUserId = mongoose.Types.ObjectId();
	var newUser = new schema.User ({
		username: username,
		questions: [],
		answers: [],
		address: address,
		upvotes: [],
		_id: createdUserId
	});
	newUser.save(function (err, user) {
        if (err) {
        	console.log(err);
        } else {
        	console.log("saved user successfully. id: " + user.id);
        }
    });
    return createdUserId;
}

var createQuestion = function(bounty, questionHash, timeExp, title, body, askerId) {
	var createdQuestionId = mongoose.Types.ObjectId();
	var newQuestion = new schema.Question ({
		answers: [],
		bounty: bounty,
		upvotes: [],
		questionHash: questionHash,
		topAnswerHash: "",
		timeExp: timeExp,
		title: title,
		body: body,
		askerId: askerId,
		_id: createdQuestionId
	});
	newQuestion.save(function (err, question) {
        if (err) {
        	console.log(err);
        } else {
        	console.log("saved question successfully");
        	console.log(question.id);
        	schema.User.findOneAndUpdate({_id: askerId}, {$push: {questions: question.id}}, {upsert: true}, function (err, doc) {
        		if (err) { console.log(err); }
        		else {
        			console.log("associated question with existing user successfully");
        		}
        	});
        }
    });
    return createdQuestionId;
    
}

var createAnswer = function(answererId, votes, voters, questionId) {
	var createdAnswerId = mongoose.Types.ObjectId();
	console.log(votes);
	console.log(voters);
	console.log(questionId);
	var newAnswer = new schema.Answer ({
		answererId: answererId,
		votes: votes,
		voters: voters,
		questionId: questionId,
		_id: createdAnswerId
	});
	newAnswer.save(function (err, answer) {
        if (err) {
        	console.log(err);
        } else {
        	console.log("saved answer successfully");
        	console.log(answer.id);
        	schema.Question.findOneAndUpdate({_id: questionId}, {$push: {answers: answer.id}}, {upsert: true}, function (err, doc) {
        		if (err) { console.log(err); }
        		else {
        			console.log("associated answer with existing question successfully");
        		}
        	});
        	schema.User.findOneAndUpdate({_id: answererId}, {$push: {answers: answer.id}}, {upsert: true}, function (err, doc) {
        		if (err) { console.log(err); }
        		else {
        			console.log("associated answer with existing user successfully");
        		}
        	});
        	return answer.id;
        }
    });
    return createdAnswerId;
}

module.exports.createUser = createUser;
module.exports.createQuestion = createQuestion;
module.exports.createAnswer = createAnswer;