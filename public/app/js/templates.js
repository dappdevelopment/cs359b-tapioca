// anonymous, self-invoking function to limit scope
(function() {

  var Templates = {};

  /* Creates an HTMLElement to display a post.
   *
   * Arguments:
   * post -- the post object with the following key-value pairs:
   *   api: the API type ('flickr', 'youtube', or 'soundcloud')
   *   title: the post title
   *   source: the source URL
   *   upvotes: the number of upvotes
   */
  Templates.renderPost = function(post) {
    // answer_tags = [];
    // for (answer of post.answers) {
    //   answer_tags.push(tag('h3', {class: 'left_block'}, answer.upvotes));
    //   answer_tags.push(tag('p', {class: 'left_block'}, answer.user_id));
    //   answer_tags.push(tag('p', {class: 'right_block'}, 'posted by ' + answer.text));
    //   answer_tags.push(tag('p', {}, 'upvotes: ' + answer.upvotes));
    //   answer_tags.push(tag('br', {}, ''));
    // }
    return tag('li', {display: "inline-block", class: "question"}, [
      tag('div', {class: 'meta'}, [
        tag('div', {class: 'left_title'}, [
            tag('h1', {}, '$' + post.bounty),
            tag('h2', {}, post.user_id)
            ]),
        tag('div', {class: 'right_title'}, [
            tag('h1', {}, post.title),
            tag('h3', {}, post.content),
            tag('a', {href: 'question_view.html?qid=' + post.id}, 'See answers >')
          ]),
      ]),
    ]);
  };

  Templates.renderQuestion = function(post) {
    return tag('li', {display: "inline-block", class: "question"}, [
      tag('div', {class: 'meta'}, [
        tag('div', {class: 'left_title'}, [
            tag('h1', {}, '$' + post.bounty),
            tag('h2', {}, post.user_id)
            ]),
        tag('div', {class: 'right_title'}, [
            tag('h1', {}, post.title),
            tag('h3', {}, post.content),
            tag('a', {href: 'question_view.html?qid=' + post.id}, 'See answers >')
          ]),
      ]),
    ]);
  }

  /* Creates an HTMLElement to display search results.
   *
   * Arguments:
   * results -- an array of search result objects, each with key-value pairs:
   *   api: the API type ('flickr', 'youtube', or 'soundcloud')
   *   title: the title of the search result
   */
  Templates.renderSearchResults = function(results) {
    if (results.length === 0) {
      return tag('span', {}, 'No results found.');
    }

    return tag('div', {}, results.map(function(result) {
      return tag('div', {class: 'result'}, [
        tag('img', {
          alt: result.api,
          src: 'images/' + result.api + '.png'
        }, []),
        tag('span', {}, result.title)
      ]);
    }));
  };

  /* Creates and returns an HTMLElement representing a tag of the given name.
   * attrs is an object, where the key-value pairs represent HTML attributes to
   * set on the tag. contents is an array of strings/HTMLElements (or just
   * a single string/HTMLElement) that will be contained within the tag.
   *
   * Examples:
   * tag('p', {}, 'A simple paragraph') => <p>A simple paragraph</p>
   * tag('a', {href: '/about'}, 'About') => <a href="/about">About</a>
   *
   * tag('ul', {}, tag('li', {}, 'First item')) => <ul><li>First item</li></ul>
   *
   * tag('div', {}, [
   *   tag('h1', {'class': 'headline'}, 'JavaScript'),
   *   ' is awesome, ',
   *   tag('span', {}, 'especially in CS42.')
   * ])
   * => <div>
   *      <h1 class="headline">JavaScript</h1>
   *      is awesome,
   *      <span>especially in CS42.</span>
   *    </div>
   */
  function tag(name, attrs, contents) {
    var element = document.createElement(name);
    for (var attr in attrs) {
      element.setAttribute(attr, attrs[attr]);
    }

    // If contents is a single string or HTMLElement, make it an array of one
    // element; this guarantees that contents is an array below.
    if (!(contents instanceof Array)) {
      contents = [contents];
    }

    contents.forEach(function(piece) {
      if (piece instanceof HTMLElement) {
        element.appendChild(piece);
      } else {
        // must create a text node for a raw string
        element.appendChild(document.createTextNode(piece));
      }
    });

    return element;
  }

  window.Templates = Templates;

})();
