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

    var q_id = getWindowQuestionID()
    xmlQuestionDetail.open("GET", remoteHost + 'question_detail?q_id=' + q_id, true)
    xmlQuestionDetail.send(null)
  }


  /* Given post information, renders a post element into $newsfeed. */
  QuestionView.renderQuestion = function($newsfeed, post) {
  	var post = post.q_data
    var postHtml = Templates.renderQuestion(post);
    $newsfeed.append(postHtml);
  };

  window.QuestionView = QuestionView;

  function getWindowQuestionID() { 
    var url_string = window.location.href
    var url = new URL(url_string);
    var q_id = url.searchParams.get("q_id");
    return q_id
  }

  function GetURLParameter(sParam)
  {
      var sPageURL = window.location.search.substring(1);
      var sURLVariables = sPageURL.split('&');
      for (var i = 0; i < sURLVariables.length; i++) 
      {
          var sParameterName = sURLVariables[i].split('=');
          if (sParameterName[0] == sParam) 
          {
              return sParameterName[1];
          }
      }
  }​

})();
