// anonymous, self-invoking function to limit scope
(function() {
  var QuestionView = {};

  // Question states
  var OPEN_STATE = 1;
  var CLOSED_STATE = 2;
  var SETTLED_STATE = 3;

  QuestionView.remoteHost = "http://127.0.0.1:3000/"
  QuestionView.activeAnswers = 0

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
    let bountyInETH = post.bounty / 1000000000000000000
    $('.left_column h1').first().html(bountyInETH + " ETH");
    $('.left_column h5').first().html(post.askerAddr);

    $('.right_column h1').first().html(post.title);
    $('.right_column h3').first().html(post.body);
  }

  QuestionView.prepareButton = function() { 
    var xmlQuestionDetail = new XMLHttpRequest();

    xmlQuestionDetail.addEventListener('load', function() {
      if (xmlQuestionDetail.status === 200) {
        let question_detail = JSON.parse(xmlQuestionDetail.responseText);
        QuestionView.question_detail = question_detail
        let highest_answerer_id = getTopAnswer(question_detail);
        if (localStorage.getItem("userAccount") == highest_answerer_id) { 
          // make account more accessible
          let timeLeft = Date.parse(QuestionView.question_detail.question.timeExp) - Date.now();
          if (timeLeft < 0) {
            $("#master").css('display', 'block')
          }
        }
      }
    });

    xmlQuestionDetail.open("GET", QuestionView.remoteHost + 'question_detail' + "?q_id=" + encodeURIComponent(QuestionView.post_data._id));
    xmlQuestionDetail.send(null);
  }


  QuestionView.render = function($newsfeed) { 
    console.log("QuestionView Rednerring...")
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

    xmlQuestionDetail.open("GET", QuestionView.remoteHost + 'question_detail' + "?q_id=" + encodeURIComponent(question_id));
    xmlQuestionDetail.send(null);

  }


  /* Given post information, renders a post element into $newsfeed. */
  QuestionView.renderQuestion = function($newsfeed, post) {
    var post_data = post.question;
    QuestionView.post_data = post_data;
    console.log("post data")
    console.log(post_data)

    adaptElements($newsfeed, post_data, post.users); 

    let answers = post.answers;

    var $answers_view = $('#answers_list')
    console.log("answers below")
    console.log(answers);

    let canUpvote = true;
    let isOpen = true; 
    if (QuestionView.post_data.state !== OPEN_STATE) { // If question is closed, disable upvoting on all answers. 
      canUpvote = false;
      isOpen = false; 
      $("#answer_input").prop('placeholder', "Question has been CLOSED. No more answers can be submitted.");
      $("#answer_input").prop('disabled', true);
      $("#answer_input_submit").hide();
      console.log("question closed. answers are not upvotable.");
    }

    if (Object.keys(answers).length == 0) {
      var no_answers = document.createElement('p');
      no_answers.innerHTML = "There have been no responses.";
      $answers_view.append(no_answers);
    } else {
      for (answer in answers) {
        let current_answer = answers[answer];
        let canUpvote; 
        if (current_answer.voters.length !== 0) {
          canUpvote = (current_answer.voters.indexOf(localStorage.getItem("userAccount")) <= -1);
        } else {
          canUpvote = true;
        }
        console.log("can upvote: " + canUpvote)
        $answers_view.append(Templates.renderAnswer(answers[answer], canUpvote, isOpen));
      }
    }
    QuestionView.prepareButton(); 
  };

  window.QuestionView = QuestionView; 
})();

//onClick Handler's 
//upvotes: 
        // $('#display').text(balance + " CDT")
function upvoteClicked(element) {
  upvote(QuestionView.question_detail.question.questionHash, QuestionView.question_detail.question.questionHash) // should be an answer hash 

  PostModel.upvote(element.className, localStorage.getItem("userAccount"));
  var upvotes = $('.' + element.className + '.upvote_count').html(); 
  console.log("upvotes query: " + upvotes)
  var counts_str = upvotes.split(' ')[1]; 

  var count = parseInt(counts_str); 
  count += 1
  console.log("upvote count: " + count)
  $('.' + element.className + '.upvote_count').html("Upvotes: " + count)
  $('input[name=upvote' + element.className + ']').remove()
  $('.' + element.className).append("<p>Upvoting Disabled</p>");
}

function createUser() {
  user_data = {
    asker_address: localStorage.getItem("userAccount"),
    user_id: "testinguser", 
  }
  PostModel.createUser(user_data)
}


function submitAnswer() {
  var box_text = document.getElementById("answer_input").value
  console.log("answer_submission " + box_text)
  console.log(QuestionView.question_id)
  console.log(localStorage.getItem("userAccount"))

  console.log("submit answer question view")
  console.log(QuestionView.question_detail.question)
  addAnswer(QuestionView.question_detail.question.questionHash, QuestionView.question_detail.question.questionHash)
  answer_data = {
    question_id: QuestionView.question_id,
    user_addr: localStorage.getItem("userAccount"), 
    text: box_text
  }
  PostModel.addAnswer(answer_data);

  answer_data["upvotes"] = 0; 
  answer_data["_id"] = -1; 

  document.getElementById("answer_input").value = "";
}


function getTopAnswer(question_detail) {
  let answerMap = QuestionView.question_detail.answers;
  let questionAnswerIds = question_detail.question.answers;
  let highest_vote_count = -1;
  let highest_answerer_id = "";
  for (answerId of questionAnswerIds) {
    let curAnswer = answerMap[answerId];
    if (curAnswer.voters.length > highest_vote_count) {
      highest_vote_count = curAnswer.voters.length;
      highest_answerer_id = curAnswer.answererAddr;
    }
  }
  return highest_answerer_id;
}

function closeQuestion() {
  distributeBounty(QuestionView.question_detail.question.questionHash);
}




