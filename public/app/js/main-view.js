// anonymous, self-invoking function to limit scope
(function() {
  var MainView = {};

  MainView.render = function($body) {
    NewsfeedView.render($body.find('#questions_list'), false);
    NewsfeedView.render($body.find('#my_answers_list'), true);
    //SearchView.render($body.find('#search'));
  };

  window.MainView = MainView;
})();
function openModal() { 
	console.log("opening modal")
	$("#add_container").css("display", "block");
}

function closeModal() { 
	$("#add_container").css("display", "none");
}

