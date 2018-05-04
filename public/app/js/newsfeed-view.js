// anonymous, self-invoking function to limit scope
(function() {
  var NewsfeedView = {};

  /* Renders the newsfeed into the given $newsfeed element. */
  NewsfeedView.render = function($newsfeed) {
    // TODO
    values = [
      {
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
  NewsfeedView.renderPost = function($newsfeed, post, updateMasonry) {
    var postHtml = Templates.renderPost(post)
    $newsfeed.append(postHtml);
    /*
    $wrappedPost.find('.remove').bind('click', function(e) {
      PostModel.remove(post._id, function(error) {
        if (error) { $('.error').text(error) }
        else {
          $newsfeed.masonry('remove', $wrappedPost);
          $newsfeed.masonry();
        }
      })
    })

    $wrappedPost.find('.upvote').bind('click', function(e) {
      PostModel.upvote(post._id, function(error, updatedPost) {
        if (error) { $('.error').text(error) }
        else {
          $wrappedPost.find('.upvote-count').text(updatedPost.upvotes)
        }
      })
    })
    $newsfeed.prepend($wrappedPost)
    

    if (updateMasonry) {
      $newsfeed.imagesLoaded(function() {
        $newsfeed.masonry('prepended', $wrappedPost);
      });
    }*/
   
  };

  window.NewsfeedView = NewsfeedView;
})();
