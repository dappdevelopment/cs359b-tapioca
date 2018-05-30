// anonymous, self-invoking function to limit scope
(function() {
  var NewsfeedView = {};
  NewsfeedView.remoteHost = "http://127.0.0.1:3000/"

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
    });

    xmlQuestions.open("GET", NewsfeedView.remoteHost + 'question_feed', true)
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
  console.log("submitting question");
  let q_title = $("#question_title").val()
  let q_details = $("textarea").val()
  let q_bounty = $("#bounty_amount").val()
  let q_time_exp_days = $("#time_exp_days").val()
  let q_time_exp_hours = $("#time_exp_hours").val()
  let q_time_exp_minutes = $("#time_exp_minutes").val()

  if (q_time_exp_days > 20 || q_time_exp_hours > 23 || q_time_exp_minutes > 59) {
    $("#submit_question_error").html("Must submit a valid time less than 20 days.");
    return;
  }
  if (!localStorage.getItem("userAccount")) {
    $("#submit_question_error").html("Log in with Metamask to use Tapioca.");
    return;
  }

  $("#question_title").val(""); 
  $("textarea").val("");
  $("#bounty_amount").val(null)

  let question_data = { 
    title: q_title, 
    details: q_details,
    asker_addr: localStorage.getItem("userAccount"), 
    bounty: q_bounty,
    time_exp_days: q_time_exp_days,
    time_exp_hours: q_time_exp_hours,
    time_exp_minutes: q_time_exp_minutes
  }

  let q_summary_string = q_bounty + q_title + q_details + localStorage.getItem("userAccount");

  let xmlHashRequest = new XMLHttpRequest();

  xmlHashRequest.addEventListener('load', function() {
      if (xmlHashRequest.status === 200) {
        var hashData = JSON.parse(xmlHashRequest.responseText)
        collectBounty(hashData.q_hash, question_data.bounty, function() { 
          console.log("adding data");
          PostModel.add(question_data);
        }); 
      }
  });

  xmlHashRequest.open("GET", NewsfeedView.remoteHost + 'question_hash' + "?summary=" + encodeURIComponent(q_summary_string));
  xmlHashRequest.send(null);
  

  $("#add_container").css("display", "none");
  $("#myPopup").show(); 
  setTimeout(function() {
      $("#myPopup").hide();
  }, 1000);
}





