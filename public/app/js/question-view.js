// anonymous, self-invoking function to limit scope
(function() {
  var QuestionView = {};

  var remoteHost = "http://127.0.0.1:3000/"

  QuestionView.render = function($newsfeed) { 
    // TODO: replace with database call.
    var xmlQuestionDetail = new XMLHttpRequest(); 

    xmlQuestionDetail.addEventListener('load', function() {
      if (xmlQuestionDetail.status === 200) {
        var question_detail = JSON.parse(xmlQuestionDetail.responseText)
        QuestionView.renderQuestion($newsfeed, question_detail)
      }
    })

    xmlQuestionDetail.open("GET", remoteHost + 'question_detail', true)
    xmlQuestionDetail.send(null)
  }


  /* Given post information, renders a post element into $newsfeed. */
  QuestionView.renderQuestion = function($newsfeed, post) {
  	var post = post.q_data
    var postHtml = Templates.renderQuestion(post);
    $newsfeed.append(postHtml);
  };

  window.QuestionView = QuestionView;
})();
