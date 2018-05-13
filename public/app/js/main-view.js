// anonymous, self-invoking function to limit scope
(function() {
  var MainView = {};

  MainView.render = function($body) {
    NewsfeedView.render($body.find('#questions_list'));
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