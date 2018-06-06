// anonymous, self-invoking function to limit scope
(function() {
  var NewsfeedView = {};
  NewsfeedView.remoteHost = "http://127.0.0.1:3000/"
  NewsfeedView.pendingQuestions = {}; 

  NewsfeedView.renderProposals = function($proposalsfeed, $memberlist) {
    var xmlProposals = new XMLHttpRequest(); 

    xmlProposals.addEventListener('load', function() {
        if (xmlProposals.status == 200) {
          var response = JSON.parse(xmlProposals.responseText);
          NewsfeedView.renderProposalsFeed($proposalsfeed, response); 
          NewsfeedView.renderMemberList($memberlist, response);
        }
    });
    xmlProposals.open("GET", NewsfeedView.remoteHost + 'member_proposals', true);
    xmlProposals.send(null);
  };

  NewsfeedView.renderProposalPost = function($proposalsfeed, post) {
    console.log("rendering proposal");
    var postHtml = Templates.renderProposalPost(post);
    $proposalsfeed.append(postHtml);
  }

  NewsfeedView.renderProposalsFeed = function($proposalsfeed, response) {
    response.proposals.forEach(function(value) {
      NewsfeedView.renderProposalPost($proposalsfeed, value, false); 
    });
  }

  NewsfeedView.renderMemberList = function($memberlist, response) {
    console.log("response json: " + JSON.stringify(response));
    $memberlist.html("members: " + JSON.stringify(response.members));
  }

  /* Renders the newsfeed into the given $newsfeed element. */
  NewsfeedView.render = function($newsfeed, isMyAnswers) {
    // TODO: replace with database call.
    var xmlQuestions = new XMLHttpRequest(); 

    xmlQuestions.addEventListener('load', function() {
      if (xmlQuestions.status === 200) {
        var questions = JSON.parse(xmlQuestions.responseText)
        console.log(questions);
        NewsfeedView.renderFeed($newsfeed, questions)
      }
    });
    if (isMyAnswers) {
      let user_addr = localStorage.getItem("userAccount");
      xmlQuestions.open("GET", NewsfeedView.remoteHost + 'my_answers_feed' + "?user_addr=" + encodeURIComponent(user_addr), true)
      xmlQuestions.send(null) 
    } else {
      xmlQuestions.open("GET", NewsfeedView.remoteHost + 'question_feed', true)
      xmlQuestions.send(null)
    }
  };

  /* Given post information, renders a post element into $newsfeed. */
  NewsfeedView.renderPost = function($newsfeed, post) {
    console.log("posttt");
    console.log(post); 
    var postHtml = Templates.renderPost(post);
    $newsfeed.append(postHtml);
  };

  NewsfeedView.renderFeed = function($newsfeed, response) { 
    response.questions.forEach(function(value) {
        NewsfeedView.renderPost($newsfeed, value, false);
    })
  }

  NewsfeedView.uploadQuestion = function(q_hash) { 
    console.log("Question Hash: " + q_hash)
    let hex_value = dec2hex(q_hash); 
    var question_data = NewsfeedView.pendingQuestions[hex_value]; 
    console.log(NewsfeedView.pendingQuestions)
    question_data["q_hash"] = hex_value; 
    PostModel.add(question_data, function(response) { 
      console.log("received response back")
      console.log(response)
    });
  }

  window.NewsfeedView = NewsfeedView;
})();

function submitProposal() { 
  console.log("submitting proposal");
  let p_proposed_member = $("#proposal_member").val();
  let p_proposal_type = $("#proposal_type").val();
  console.log("submitProposal: p_proposal_type: " + p_proposal_type);
  let p_is_add = false;
  if (p_proposal_type === "add") {
    p_is_add = true;
  }

  if (!localStorage.getItem("userAccount")) {
    $("#submit_question_error").html("Log in with Metamask to use Tapioca.");
    return;
  }
  let p_proposing_member = localStorage.getItem("userAccount");

  let createProposalRequest = new XMLHttpRequest();
  createProposalRequest.addEventListener('load', function() {
      if (createProposalRequest.status === 200) {
        console.log("created proposal");
      }
  });

  createProposalRequest.open("POST", '/create_proposal');
  createProposalRequest.setRequestHeader('Content-type', 'application/json')
  createProposalRequest.send(JSON.stringify({proposing_user_addr: p_proposing_member, proposed_user_addr: p_proposed_member, is_add_proposal: p_is_add}))
  
  $("#create_proposal_container").css("display", "none");
  $("#proposalCreatedPopup").show(); 
  setTimeout(function() {
      $("#proposalCreatedPopup").hide();
  }, 1000);
}

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

  console.log("Outside Title: " + question_data.title); 

  let q_summary_string = q_bounty + q_title + q_details + localStorage.getItem("userAccount");

  let xmlHashRequest = new XMLHttpRequest();

  xmlHashRequest.addEventListener('load', function() {
      if (xmlHashRequest.status === 200) {
        var hashData = JSON.parse(xmlHashRequest.responseText)


        let timeToClose = question_data.time_exp_days * 24 * 3600 * 1000 + question_data.time_exp_hours * 3600 * 1000 + question_data.time_exp_minutes * 60 * 1000;
        let timeExp = Date.now() + timeToClose;

        collectBounty(hashData.q_hash, question_data.bounty, timeExp, function() { 
          console.log("Bounty Request Submitted");
        });
        console.log("Question Hash: " + hashData.q_hash) 
        NewsfeedView.pendingQuestions[hashData.q_hash] = question_data; 
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

function upvoteProposalClicked(element) {
  console.log("element printing")
  console.log(element)
  PostModel.upvoteProposal(element.className, localStorage.getItem("userAccount"));
  var votes = $('.' + element.className + '.vote_count').html(); 
  console.log("votes query: " + votes)
  var counts_str = votes.split(' ')[3]; // hard coded for now

  var count = parseInt(counts_str); 
  count += 1
  console.log("vote count: " + count)
  $('.' + element.className + '.vote_count').html("Current Vote Count: " + count)
  $('input[name=upvote' + element.className + ']').remove()
  $('input[name=downvote' + element.className + ']').remove()
  $('.' + element.className).append("<p>You have already voted on this proposal</p>");
}

function downvoteProposalClicked(element) {
  console.log("element printing")
  console.log(element)
  PostModel.downvoteProposal(element.className, localStorage.getItem("userAccount"));
  var votes = $('.' + element.className + '.vote_count').html(); 
  console.log("votes query: " + votes)
  var counts_str = votes.split(' ')[3]; 

  var count = parseInt(counts_str); 
  count -= 1
  console.log("vote count: " + count)
  $('.' + element.className + '.vote_count').html("Current Vote Count: " + count)
  $('input[name=upvote' + element.className + ']').remove()
  $('input[name=downvote' + element.className + ']').remove()
  $('.' + element.className).append("<p>You have already voted on this proposal</p>");
}

function openTab(evt, tabName) {
  console.log("opening tab: " + tabName);
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function dec2hex(str){ // .toString(16) only works up to 2^53
    var dec = str.toString().split(''), sum = [], hex = [], i, s
    while(dec.length){
        s = 1 * dec.shift()
        for(i = 0; s || i < sum.length; i++){
            s += (sum[i] || 0) * 10
            sum[i] = s % 16
            s = (s - sum[i]) / 16
        }
    }
    while(sum.length){
        hex.push(sum.pop().toString(16))
    }
    return hex.join('')
}





