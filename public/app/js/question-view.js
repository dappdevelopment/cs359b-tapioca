// anonymous, self-invoking function to limit scope
(function() {
  var QuestionView = {};

  var remoteHost = "http://127.0.0.1:3000/"

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function adaptElements($newsfeed, post) { 
    $('.left_column h1').first().html('$' + post.bounty) 
    $('.left_column h2').first().html(post.askerId) 

    $('.right_column h1').first().html(post.title)
    $('.right_column h3').first().html(post.body) 
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

    xmlQuestionDetail.open("GET", remoteHost + 'question_detail' + "?q_id=" + encodeURIComponent(question_id))
    xmlQuestionDetail.send(null)
  }


  /* Given post information, renders a post element into $newsfeed. */
  QuestionView.renderQuestion = function($newsfeed, post) {
    console.log(post)

    var post_data = post.question

    adaptElements($newsfeed, post_data); 

    let answers = post.answers;

    var $answers_view = $('#answers_list')
    console.log(answers)

    if (Object.keys(answers).length == 0) {
      var no_answers = document.createElement('p');
      no_answers.innerHTML = "There have been no responses.";
      $answers_view.append(no_answers)
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
  PostModel.upvote(QuestionView.question_id, element.className);
  var upvotes = $('.' + element.className + '.upvote_count').html(); 
  console.log("upvotes query: " + upvotes)
  var counts_str = upvotes.split(' ')[1]; 

  var count = parseInt(counts_str); 
  console.log("upvote count: " + count)
  count += 1
  $('.' + element.className + '.upvote_count').html("Upvotes: " + count)
}

function submitAnswer() {
  console.log('omg')
  var box_text = document.getElementById("answer_input").value
  console.log("answer_submission " + box_text)
  answer_data = {
    question_id: QuestionView.question_id,
    user_id: "chachang", 
    text: box_text
  }
  PostModel.addAnswer(answer_data)

  answer_data["upvotes"] = 0; 
  answer_data["id"] = -1; 

  var $answers_view = $('#answers_list')
  var answer = Templates.renderAnswer(answer_data, false)
  $answers_view.append(answer)
  document.getElementById("answer_input").value = "";
}