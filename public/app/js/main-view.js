// anonymous, self-invoking function to limit scope
(function() {
  var MainView = {};

  MainView.render = function($body) {
    NewsfeedView.render($body.find('#questions_list'));
    //SearchView.render($body.find('#search'));
  };

  window.MainView = MainView;
})();

function submitQuestion(){
    let title = document.getElementById("question_title").value;
    let body = document.getElementById("question_body").value;
    let bounty = document.getElementById("question_bounty").value;
    let time_exp = document.getElementById("question_time_exp").value;
    $.ajax({
        url:'/submit_question',
        data: {title: title, body: body, bounty: bounty, time_exp: time_exp},
        type:'POST'
    });
}

function openModal() { 
	console.log("opening modal")
	$("#add_container").css("display", "block");
}

function closeModal() { 
	$("#add_container").css("display", "none");
}

