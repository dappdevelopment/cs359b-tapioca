// anonymous, self-invoking function to limit scope
(function() {
  //var remoteHost = 'http://localhost:3000/'
  var remoteHost = "http://127.0.0.1:3000/"

  var NewsfeedView = {};

  /* Renders the newsfeed into the given $newsfeed element. */
  NewsfeedView.render = function($newsfeed) {
    // TODO: replace with database call.
    var xmlQuestions = new XMLHttpRequest(); 
    xmlQuestions.onreadystatechange = function($newsfeed) { 
      console.log("on ready state change")
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {

      }
    }

    xmlQuestions.addEventListener('load', function() {
      if (xmlQuestions.status === 200) {
        var questions = JSON.parse(xmlQuestions.responseText)
        NewsfeedView.renderFeed($newsfeed, questions)
      }
    })

    xmlQuestions.open("GET", remoteHost + 'question_feed', true)
    xmlQuestions.send(null)
  };

  /* Given post information, renders a post element into $newsfeed. */
  NewsfeedView.renderPost = function($newsfeed, post) {
    var postHtml = Templates.renderPost(post)
    $newsfeed.append(postHtml);
   
  };

  NewsfeedView.renderFeed = function($newsfeed, response) { 
    console.log("rendering feed ... ")
    console.log("http response" + response)
    values = response.questions

    values.forEach(function(value) {
        NewsfeedView.renderPost($newsfeed, value, false) 
    })

  }

  window.NewsfeedView = NewsfeedView;
})();
