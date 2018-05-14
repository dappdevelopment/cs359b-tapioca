var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    questions: [{type: mongoose.Schema.ObjectId}],
    answers: [{type: mongoose.Schema.ObjectId}],
    address: {type: String, unique: true},
    upvotes: [{type: mongoose.Schema.ObjectId}]
});

var QuestionSchema = new mongoose.Schema({
    answers: [{type: mongoose.Schema.ObjectId}],
    bounty: {type: Number},
    upvotes: [{type: mongoose.Schema.ObjectId}],
    questionHash: {type: String},
   	topAnswerHash: {type: String},
    timeExp: {type: Date},
    title: {type: String},
    body: {type: String},
    askerId: {type: mongoose.Schema.ObjectId}
});

var AnswerSchema = new mongoose.Schema({
    answererId: {type: String, required: true},
    voters: [{type: mongoose.Schema.ObjectId}],
    questionId: {type: String},
    body: {type: String}
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
