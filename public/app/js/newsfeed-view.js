// anonymous, self-invoking function to limit scope
(function() {
  var NewsfeedView = {};

  /* Renders the newsfeed into the given $newsfeed element. */
  NewsfeedView.render = function($newsfeed) {
    // TODO: replace with database call.
    values = [
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
      },
      {
        id: "f02j90r3i0k023jr",
        title: "Peter is Cool",
        content: "Hi hi hi hi",
        bounty: 50,
        user_id: "varun",
        upvotes: 1000,
        answers: [
          {
            text: "Chickens",
            user_id: "alex_lee",
            upvotes: 4
          },
          {
            text: "Cats",
            user_id: "maddie_wang",
            upvotes: 8
          }, 
        ]
      }
    ]
    console.log("rendering")
    values.forEach(function(value) {
        NewsfeedView.renderPost($newsfeed, value, false) 
    })
  };

  /* Given post information, renders a post element into $newsfeed. */
  NewsfeedView.renderPost = function($newsfeed, post) {
    var postHtml = Templates.renderPost(post)
    $newsfeed.append(postHtml);
   
  };

  window.NewsfeedView = NewsfeedView;
})();
