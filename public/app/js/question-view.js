// anonymous, self-invoking function to limit scope
(function() {
  var QuestionView = {};

  QuestionView.remoteHost = "http://127.0.0.1:3000/"

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function adaptElements($newsfeed, post, users) { 
    $('.left_column h1').first().html('$' + post.bounty);
    $('.left_column h5').first().html(users[post.askerId]);

    $('.right_column h1').first().html(post.title);
    $('.right_column h3').first().html(post.body);
  }

  QuestionView.render = function($newsfeed) { 
    // TODO: replace with database call.
    var xmlQuestionDetail = new XMLHttpRequest(); 

    var question_id = getParameterByName("qid"); 
    QuestionView.question_id = question_id; 
    console.log("question_ID " + question_id)

    xmlQuestionDetail.addEventListener('load', function() {
      if (xmlQuestionDetail.status === 200) {
        var question_detail = JSON.parse(xmlQuestionDetail.responseText)
        QuestionView.renderQuestion($newsfeed, question_detail)
      }
    })

    xmlQuestionDetail.open("GET", QuestionView.remoteHost + 'question_detail' + "?q_id=" + encodeURIComponent(question_id))
    xmlQuestionDetail.send(null)
  }


  /* Given post information, renders a post element into $newsfeed. */
  QuestionView.renderQuestion = function($newsfeed, post) {
    console.log(post)

    var post_data = post.question;
    QuestionView.post_data = post_data;

    adaptElements($newsfeed, post_data, post.users); 

    let answers = post.answers;

    var $answers_view = $('#answers_list')
    console.log(answers)

    if (Object.keys(answers).length == 0) {
      var no_answers = document.createElement('p');
      no_answers.innerHTML = "There have been no responses.";
      $answers_view.append(no_answers);
    } else {
      for (answer in answers) {
        $answers_view.append(Templates.renderAnswer(answers[answer], post.users, true));
      }
    }
  };

  window.QuestionView = QuestionView; 
})();


//onClick Handler's 
//upvotes: 
function upvoteClicked(element) {
  let placeholder_id = "a3cf3bb3421e45f61dce82f1"; // placeholder for user ID
  PostModel.upvote(element.className, placeholder_id);
  var upvotes = $('.' + element.className + '.upvote_count').html(); 
  console.log("upvotes query: " + upvotes)
  var counts_str = upvotes.split(' ')[1]; 

  var count = parseInt(counts_str); 
  console.log("upvote count: " + count)
  count += 1
  $('.' + element.className + '.upvote_count').html("Upvotes: " + count)
}

function createUser() {
  user_data = {
    asker_address: localStorage.getItem("userAccount"),
    user_id: "testinguser", 
  }
  PostModel.createUser(user_data)
}

function submitAnswer() {
  console.log('omg')
  var box_text = document.getElementById("answer_input").value
  console.log("answer_submission " + box_text)
  answer_data = {
    question_id: QuestionView.question_id,
    user_id: "9b7680a1aed4535a675c6ed7", 
    text: box_text
  }
  PostModel.addAnswer(answer_data)

  answer_data["upvotes"] = 0; 
  answer_data["id"] = -1; 

  var $answers_view = $('#answers_list')
  var answer = Templates.renderAnswer(answer_data, false)
  $answers_view.append(answer);
  document.getElementById("answer_input").value = "";
}

function getTopAnswer(question_detail) {
  let answerMap = question_detail.answers;
  let questionAnswerIds = question_detail.question.answers;
  let highest_vote_count = -1;
  let highest_answerer_id = "";
  for (answerId of questionAnswerIds) {
    let curAnswer = answerMap[answerId];
    if (curAnswer.voters.length > highest_vote_count) {
      highest_vote_count = curAnswer.voters.length;
      highest_answerer_id = curAnswer.answererId;
    }
  }
  return highest_answerer_id;
}

function closeQuestion() {
  console.log("closing question");
  var xmlQuestionDetail = new XMLHttpRequest();

  xmlQuestionDetail.addEventListener('load', function() {
    if (xmlQuestionDetail.status === 200) {
      let question_detail = JSON.parse(xmlQuestionDetail.responseText);
      let highest_answerer_id = getTopAnswer(question_detail);
      console.log("winner is " + highest_answerer_id);
      console.log(question_detail);
      console.log("call metamask");
      distributeBounty(highest_answerer_id, "hi claire", question_detail.question.questionHash);
    }
  });
  xmlQuestionDetail.open("GET", QuestionView.remoteHost + 'question_detail' + "?q_id=" + encodeURIComponent(QuestionView.post_data._id));
  xmlQuestionDetail.send(null);
}




