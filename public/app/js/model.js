var mongoose = require('mongoose');
var schema = require('./schema');
var ObjectId = mongoose.Types.ObjectId;

var uristring = process.env.MONGODB_URI || "mongodb://localhost:27017/tapioca";

var sha256 = require('js-sha256').sha256;

// Question states
var OPEN_STATE = 1;
var CLOSED_STATE = 2;
var SETTLED_STATE = 3;

mongoose.connect(uristring, function (err, res) {
    if (err) {
      	console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
      	console.log ('Successfully connected to: ' + uristring);
    }
});

var createUser = async function(username, address) {
	let newUser = new schema.User ({
		username: username,
		questions: [],
		answers: [],
		address: address,
		upvotes: []
	});
	try {
		let savedUser = await schema.User.findOneAndUpdate({address: address}, {$setOnInsert: newUser}, {upsert: true, returnNewDocument: true});
		console.log("saved user successfully");
		console.log(savedUser); 
		return address;
	} catch (err) {
		console.log("err in createUser");
		console.log(err);
	}
}

async function markQuestionClosed(questionId) {
	let updated_question = await schema.Question.find({_id: questionId});
	let answers = await schema.Answer.find({_id: {$in: updated_question[0]._doc.answers}});
	let winning_votes = -1; 
	let winning_answer_text = "";
	let winning_answer_id = "";
	if (answers.length == 0) { // adding a placeholder "question closed" answer
		let placeholder_answer = await createAnswer(updated_question[0]._doc.askerAddr, questionId, "No answer was received for this question... refunding bounty.");
		answers.push(placeholder_answer);
	}
	for (answer of answers) {
		if (answer.voters.length > winning_votes) {
			winning_votes = answer.voters.length;
			winning_answer_text = answer.body;
			winning_answer_id = answer._id;
		}
	}
	let winning_answer_hash = sha256(winning_answer_text);
	await schema.Question.findOneAndUpdate({_id: questionId}, 
		{state: CLOSED_STATE,
		topAnswerHash: winning_answer_hash,
		topAnswerId: winning_answer_id}
	);
	console.log("winning_answer_id: " + winning_answer_id); // ID is ""
	await schema.Answer.findOneAndUpdate({_id: winning_answer_id}, {isWinner: true});

	console.log("marked question closed");
}

var createQuestion = async function(bounty, timeExpDays, timeExpHours, timeExpMinutes, title, body, askerAddr) {
	console.log("askerAddr: " + askerAddr);
	let questionHash = sha256(bounty + title + body + askerAddr);
	let timeToClose = timeExpDays * 24 * 3600 * 1000 + timeExpHours * 3600 * 1000 + timeExpMinutes * 60 * 1000
	let timeExp = Date.now() + timeToClose
	let newQuestion = new schema.Question ({
		answers: [],
		bounty: bounty,
		upvotes: [],
		questionHash: questionHash,
		topAnswerHash: "",
		timeExp: timeExp,
		title: title,
		body: body,
		askerAddr: askerAddr,
		state: OPEN_STATE
	});
	try {
		let savedQuestion = await newQuestion.save();
		await schema.User.findOneAndUpdate({address: askerAddr}, {$push: {questions: savedQuestion.id}}, {upsert: true});
		setTimeout(function() {
			markQuestionClosed(savedQuestion._id);
		}, timeToClose);
		return {questionHash: questionHash, questionId: savedQuestion._id};
	} catch (err) {
		console.log("error in create question!");
		console.log(err);
	}
}

var createAnswer = async function(answererAddr, questionId, body) {
	let newAnswer = new schema.Answer ({
		answererAddr: answererAddr,
		voters: [],
		questionId: questionId,
		body: body
	});
	try {
		console.log(newAnswer); 
		let savedAnswer = await newAnswer.save();
		let updatedQuestion = await schema.Question.findOneAndUpdate({_id: questionId}, {$push: {answers: savedAnswer.id}}, {upsert: true});
		let updatedUser = await schema.User.findOneAndUpdate({address: answererAddr}, {$push: {answers: savedAnswer.id}}, {upsert: true});
		return savedAnswer;
	} catch (err) {
		console.log("error in createanswer");
		console.log(err);
	}
}

var upvoteAnswer = async function(answerId, voterAddr) {
	try {
		let updatedAnswer = await schema.Answer.findOneAndUpdate({_id: answerId}, {$addToSet: {voters: voterAddr}}, {upsert: true});
		let updatedUser = await schema.User.findOneAndUpdate({address: voterAddr}, {$addToSet: {answers: answerId}}, {upsert: true});
		console.log("updated answer successfully");
	} catch (err) {
		console.log("error in upvote answer");
		console.log(err);
	}
}

var resetDB = async function() {
	try {
		await schema.Answer.remove({});
		await schema.Question.remove({});
		await schema.User.remove({});
		console.log("successful deletion");
	} catch (err) {
		console.log("error during removal");
		console.log(err);
	}
}

var findQuestionFeedData = async function() {
	try {
		let questions = await schema.Question.find({});
		let users = await schema.User.find({});
		let userMap = {};
		for (user of users){
			userMap[user._id] = user.address; // map from user to their eth address.
		}
		let modified_question_list = []
		for (let i in questions) {
			modified_question = JSON.parse(JSON.stringify(questions[i])); // deep copy 
			let timeLeft = Math.max(Date.parse(modified_question.timeExp) - Date.now(), 0);
			modified_question.timeLeft = timeLeft;
			modified_question_list.push(modified_question)
		}
		return {questions: modified_question_list, users: userMap};
	} catch (err) {
		console.log("error in findQuestionFeedData");
		console.log(err);
	}
}

var findQuestionData = async function(questionId) {
	try {
		let question_list = await schema.Question.find({_id: questionId});
		let users = await schema.User.find({});
		let userMap = {};
		for (user of users){
			userMap[user._id] = user.address;
		}
		question = question_list[0]
		let answerIds = question.answers;
		let answers = await schema.Answer.find({_id: {$in: answerIds}});
		let answerMap = {};
		for (answer of answers) {
			answerMap[answer._id] = answer;
		}
		return {question: question, answers: answerMap, users: userMap};
	} catch (err) {
		console.log("error in findQuestionData");
		console.log(err);
	}
}

var findQuestion = async function(questionId) {
	try {
		let foundQuestion = await schema.Question.find({_id: questionId});
		return foundQuestion;
	} catch (err) {
		console.log("error in getQuestion");
		console.log(err);
	}
}
var findAnswer = async function(answerId) {
	try {
		let foundAnswer = await schema.Answer.find({_id: answerId});
		return foundAnswer;
	} catch (err) {
		console.log("error in getAnswer");
		console.log(err);
	}
}
var findUser = async function(userId) {
	try {
		let foundUser = await schema.User.find({_id: userId});
		return foundUser;
	} catch (err) {
		console.log("error in getUser");
		console.log(err);
	}
}

module.exports.createUser = createUser;
module.exports.createQuestion = createQuestion;
module.exports.createAnswer = createAnswer;
module.exports.upvoteAnswer = upvoteAnswer;
module.exports.resetDB = resetDB;
module.exports.findQuestion = findQuestion;
module.exports.findUser = findUser;
module.exports.findAnswer = findAnswer;
module.exports.findQuestionFeedData = findQuestionFeedData;
module.exports.findQuestionData = findQuestionData;
module.exports.markQuestionClosed = markQuestionClosed;



