// anonymous, self-invoking function to limit scope
(function() {
  var QuestionMainView = {};

  QuestionMainView.render = function($body) {
  	console.log("question main view");
    QuestionView.render($body.find('#questions_list'));
    SearchView.render($body.find('#search'));
  };

  window.QuestionMainView = QuestionMainView;
})();
