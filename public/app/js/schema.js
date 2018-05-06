var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    questions: [{type: Object}],
    answers: [{type: Object}],
    address: {type: String},
    upvotes: [{type: Object}]
});

var QuestionSchema = new mongoose.Schema({
    answers: [{type: Object}],
    bounty: {type: Number},
    upvotes: [{type: Object}],
    questionHash: {type: String},
   	topAnswerHash: {type: String},
    timeExp: {type: Date},
    title: {type: String},
    body: {type: String}
});

var AnswerSchema = new mongoose.Schema({
    answererId: {type: String, required: true},
    votes: {type: Number},
    voters: [{type: Object}]
});


// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', UserSchema);
var Question = mongoose.model('Question', QuestionSchema);
var Answer = mongoose.model('Answer', AnswerSchema);

// make this available to our photos in our Node applications
module.exports.User = User;
module.exports.Question = Question;
module.exports.Answer = Answer;