// anonymous, self-invoking function to limit scope
(function() {
  var PostModel = {};

  var POSTS_URL= '/posts';
  var STATUS_OK = 200

  /**
   * Loads all newsfeed posts from the server.
   *
   * Calls: callback(error, posts)
   *  error -- the error that occurred or null if no error occurred
   *  results -- an array of newsfeed posts
   */
  PostModel.loadAll = function(callback) {
    var postRequest = new XMLHttpRequest()
    postRequest.addEventListener('load', function() {
      if (postRequest.status === STATUS_OK) {
        var posts = JSON.parse(postRequest.responseText)
        callback(null, posts)
      } else {
        callback(postRequest.responseText)
      }
    })

    postRequest.open('GET', POSTS_URL)
    postRequest.send()
  };

  /* Adds the given post to the list of posts. The post must *not* have
   * an _id associated with it.
   *
   * Calls: callback(error, post)
   *  error -- the error that occurred or null if no error occurred
   *  post -- the post added, with an _id attribute
   */
  PostModel.add = function(post, callback) {
    var addPostRequest = new XMLHttpRequest()

    addPostRequest.open('POST', '/submit_question')
    addPostRequest.setRequestHeader('Content-type', 'application/json')
    addPostRequest.send(JSON.stringify(post))

    collectBounty(1234, post.bounty); // 1234 is the question hash
  };

  /* Upvotes the post with the given id.
   *
   * Calls: callback(error, post)
   *  error -- the error that occurred or null if no error occurred
   *  post -- the updated post model
   */
  PostModel.upvote = function(question_id, answer_id) {
    var upvoteRequest = new XMLHttpRequest()

    upvoteRequest.open('POST', '/upvote')
    upvoteRequest.setRequestHeader('Content-type', 'application/json')
    upvoteRequest.send(JSON.stringify({question_id: question_id, answer_id: answer_id}))
  };

  PostModel.addAnswer = function(answer_data) {
    var answerRequest = new XMLHttpRequest()
    
    answerRequest.open('POST', '/add_answer')
    answerRequest.setRequestHeader('Content-type', 'application/json')
    answerRequest.send(JSON.stringify(answer_data))
  };

  PostModel.createUser = function(user_data) {
    var createUserRequest = new XMLHttpRequest()

    createUserRequest.open('POST', '/create_user')
    createUserRequest.setRequestHeader('Content-type', 'application/json')
    createUserRequest.send(JSON.stringify(user_data))
  };

  window.PostModel = PostModel;
})();
