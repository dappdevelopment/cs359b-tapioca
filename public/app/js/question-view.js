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
    $('.left_column h2').first().html(post.user_id) 

    $('.right_column h1').first().html(post.title)
    $('.right_column h3').first().html(post.content) 
  }

  QuestionView.render = function($newsfeed) { 
    // TODO: replace with database call.
    var xmlQuestionDetail = new XMLHttpRequest(); 

    var question_id = getParameterByName("qid"); 
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
  	var post_data = post.q_data

    adaptElements($newsfeed, post_data); 


    var answers = post_data.answers 

    var $answers_view = $('#answers_list')

    if (answers.length == 0) {
      var no_answers = document.createElement('p');
      no_answers.innerHTML = "There have been no responses.";
      $answers_view.append(no_answers)
    } else {
      answers.forEach(function(value) {
        var answer = Templates.renderAnswer(value)
        $answers_view.append(answer)
      }) 
    }
  };


  window.QuestionView = QuestionView; 
})();
