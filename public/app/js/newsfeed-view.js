// anonymous, self-invoking function to limit scope
(function() {
  var remoteHost = "http://tapioca-dapp.herokuapp.com/"

  var NewsfeedView = {};

  /* Renders the newsfeed into the given $newsfeed element. */
  NewsfeedView.render = function($newsfeed) {
    // TODO: replace with database call.
    var xmlQuestions = new XMLHttpRequest(); 

    xmlQuestions.addEventListener('load', function() {
      if (xmlQuestions.status === 200) {
        var questions = JSON.parse(xmlQuestions.responseText)
        console.log(questions);
        NewsfeedView.renderFeed($newsfeed, questions)
      }
    })

    xmlQuestions.open("GET", remoteHost + 'question_feed', true)
    xmlQuestions.send(null)
  };

  /* Given post information, renders a post element into $newsfeed. */
  NewsfeedView.renderPost = function($newsfeed, post, users) {
    console.log("posttt");
    console.log(post); 
    var postHtml = Templates.renderPost(post, users)
    $newsfeed.append(postHtml);
   
  };

  NewsfeedView.renderFeed = function($newsfeed, response) { 
    response.questions.forEach(function(value) {
        NewsfeedView.renderPost($newsfeed, value, response.users, false) 
    })

  }

  window.NewsfeedView = NewsfeedView;
})();

function submitQuestion() { 
  let q_title = $("#question_title").val()
  let q_details = $("textarea").val()
  let q_bounty = $('#bounty_amount').val()
  let q_time_exp = $('#time_exp').val()

  $("#question_title").val(""); 
  $("textarea").val("");
  $('#bounty_amount').val(null)

  

  var question_data = { 
    title: q_title, 
    details: q_details,
    user_id: localStorage.getItem("userAccount"), 
    bounty: q_bounty,
    time_exp: q_time_exp
  }

  PostModel.add(question_data, function(body) {
    console.log(JSON.parse(body)); 
    collectBounty(JSON.parse(body).qHash, question_data.bounty); 
  })

  $("#add_container").css("display", "none");
  $("#myPopup").show(); 
  setTimeout(function() {
      $("#myPopup").hide();
  }, 1000);
}





