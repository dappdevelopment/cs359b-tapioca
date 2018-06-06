var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    questions: [{type: mongoose.Schema.ObjectId}],
    answers: [{type: mongoose.Schema.ObjectId}],
    questions_answered: [{type: mongoose.Schema.ObjectId}],
    address: {type: String, unique: true},
    upvotes: [{type: String}]
});

var QuestionSchema = new mongoose.Schema({
    answers: [{type: mongoose.Schema.ObjectId}],
    bounty: {type: Number},
    upvotes: [{type: String}],
    questionHash: {type: String},
   	topAnswerHash: {type: String},
    topAnswerId: {type: mongoose.Schema.ObjectId},
    timeExp: {type: Date},
    title: {type: String},
    body: {type: String},
    askerAddr: {type: String},
    state: {type: Number} // enumerated type
});

var AnswerSchema = new mongoose.Schema({
    answererAddr: {type: String, required: true},
    voters: [{type: String}],
    questionId: {type: String},
    body: {type: String},
    isWinner: {type: Boolean, default: false}
});

var ProposalSchema = new mongoose.Schema({
    upvotes: [{type: String}], // addresses
    downvotes: [{type: String}], // addresses
    proposedMemberAddr: {type: String},
    proposingMemberAddr: {type: String},
    timeExp: {type: Date},
    state: {type: Number},
    type: {type: Number}
});

var MemberTrackerSchema = new mongoose.Schema({ // There should only be one of these.
    members: [{}],
    id: {type: String}
})

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', UserSchema);
var Question = mongoose.model('Question', QuestionSchema);
var Answer = mongoose.model('Answer', AnswerSchema);
var Proposal = mongoose.model('Proposal', ProposalSchema);
var MemberTracker = mongoose.model('MemberTracker', MemberTrackerSchema);

// make this available to our photos in our Node applications
module.exports.User = User;
module.exports.Question = Question;
module.exports.Answer = Answer;
module.exports.Proposal = Proposal;
module.exports.MemberTracker = MemberTracker;
