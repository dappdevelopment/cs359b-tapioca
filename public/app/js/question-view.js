// anonymous, self-invoking function to limit scope
(function() {
  var QuestionView = {};

  /* Renders the newsfeed into the given $newsfeed element. */
  QuestionView.render = function($newsfeed) {
    // TODO: replace with database call.
    value =
      {
        id: "f02j90r3i0k023jr",
        title: "Max is Cool",
        content: "I have a question please answer",
        bounty: 60,
        user_id: "max",
        upvotes: 100,
        answers: [
          {
            text: "Hello world",
            user_id: "max_imaginary_gf",
            upvotes: 5
          },
          {
            text: "Hello max",
            user_id: "claire",
            upvotes: 2
          }, 
        ]
      }
    console.log("rendering");
    QuestionView.renderQuestion($newsfeed, value, false);
  };

  /* Given post information, renders a post element into $newsfeed. */
  QuestionView.renderQuestion = function($newsfeed, post) {
  	console.log("redepiefioweroiwe");
    var postHtml = Templates.renderQuestion(post);
    $newsfeed.append(postHtml);
  };

  window.QuestionView = QuestionView;
})();
