// anonymous, self-invoking function to limit scope
(function() {
  var QuestionMainView = {};

  QuestionMainView.render = function($body) {
    QuestionView.render($body.find('#questions_list'));
    SearchView.render($body.find('#search'));
  };

  window.QuestionMainView = QuestionMainView;
})();
