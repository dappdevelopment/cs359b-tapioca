var mongoose = require('mongoose');
var schema = require('./schema');
var ObjectId = mongoose.Types.ObjectId;

var uristring = process.env.MONGODB_URI || "mongodb://localhost:27017/tapioca";

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

var createQuestion = async function(bounty, timeExp, title, body, askerId, questionHash, askerAddr) {
	console.log("askerId: " + askerId);
	let newQuestion = new schema.Question ({
		answers: [],
		bounty: bounty,
		upvotes: [],
		questionHash: questionHash,
		topAnswerHash: "",
		timeExp: timeExp,
		title: title,
		body: body,
		askerId: askerId
	});
	try {
		let savedQuestion = await newQuestion.save();
		await schema.User.findOneAndUpdate({address: askerAddr}, {$push: {questions: savedQuestion.id}}, {upsert: true});
		return savedQuestion.id;
	} catch (err) {
		console.log("error in create question!");
		console.log(err);
	}
}

var createAnswer = async function(answererId, questionId, body) {
	let newAnswer = new schema.Answer ({
		answererId: answererId,
		voters: [],
		questionId: questionId,
		body: body
	});
	try {
		console.log(newAnswer); 
		let savedAnswer = await newAnswer.save();
		let updatedQuestion = await schema.Question.findOneAndUpdate({_id: questionId}, {$push: {answers: savedAnswer.id}}, {upsert: true});
		let updatedUser = await schema.User.findOneAndUpdate({address: answererId}, {$push: {answers: savedAnswer.id}}, {upsert: true});
		return savedAnswer.id;
	} catch (err) {
		console.log("error in createanswer");
		console.log(err);
	}
}

var upvoteAnswer = async function(answerId, voterAddr) {
	// voterID: 0xC6941bc0804722076716F4ba131D7B7B663E0a92
	// answerID: 5af9d02e092138575b67a58a
	// user id wasnt being used and its actually user address. change schema? or figure out new way to do this
	try {
		let placeholder_id = ObjectId("73b312067720199e377e6fb9"); // random 24 digit hex string
		let updatedAnswer = await schema.Answer.findOneAndUpdate({_id: answerId}, {$push: {voters: placeholder_id}}, {upsert: true});
		let updatedUser = await schema.User.findOneAndUpdate({address: voterAddr}, {$push: {answers: answerId}}, {upsert: true});
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
		return {questions: questions, users: userMap};
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



