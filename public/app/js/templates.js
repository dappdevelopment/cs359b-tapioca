// anonymous, self-invoking function to limit scope
(function() {

  var Templates = {};

  Templates.renderMember = function(member_addr) {
    return tag('div', {style:"margin-bottom: 5px;"}, member_addr)
  }

  Templates.renderProposalPost = function(post, type) {
    console.log(post); 
    let days = Math.floor(post.timeLeft / (24 * 3600 * 1000))
    let hours = Math.floor((post.timeLeft % (24 * 3600 * 1000)) / (3600 * 1000))
    let minutes = Math.ceil((post.timeLeft % (3600 * 1000)) / (60 * 1000))
    let totalVotes = post.upvotes.length - post.downvotes.length;
    let currentUserAddr = localStorage.getItem("userAccount");
    let status = (type == 4) ? "Add" : "Remove"

    let upvote_tags = [tag('p', {class: "vote_count " + post._id}, "Current Vote Count: " + totalVotes)];
    if (post.upvotes.includes(currentUserAddr) || post.downvotes.includes(currentUserAddr)) {
      upvote_tags.push(tag('p', {}, "You have already voted on this proposal"))
    } else {
      upvote_tags.push(tag('input', {type:"submit", name: "upvote" + post._id, value: "Upvote", class: status+":"+post._id, "id": post.proposedMemberAddr, onclick: "upvoteProposalClicked(this)"}))
      upvote_tags.push(tag('input', {style: "margin-left: 8px;", type:"submit", name: "downvote" + post._id, value: "Downvote", class: status+":"+post._id, "id": post.proposedMemberAddr, onclick: "downvoteProposalClicked(this)"}))
    }

    return tag('li', {display: "inline-block", class: "post"}, [
      tag('div', {class: 'meta'}, [
        tag('div', {class: 'left_title'}, [
            tag('h2', {class:"q-description"}, "Time Left: " + days + " days, " + hours + " hrs, " + minutes + " mins"),
            tag('h5', {style:"line-height: 1.8em;"}, "Proposed by: " + post.proposingMemberAddr)
            ]),
        tag('div', {class: 'voting_title'}, [
            tag('h1', {}, status + ":" + post.proposedMemberAddr)
          ]),
        tag('div', {class: "voting_tally"}, upvote_tags),  // TODO: visual issues
      ]),
    ]);
  };

  /* Creates an HTMLElement to display a post.
   *
   * Arguments:
   * post -- the post object with the following key-value pairs:
   *   api: the API type ('flickr', 'youtube', or 'soundcloud')
   *   title: the post title
   *   source: the source URL
   *   upvotes: the number of upvotes
   */
  Templates.renderPost = function(post, show_link=true) {
    console.log("post1"); 
    console.log(post); 
    let days = Math.floor(post.timeLeft / (24 * 3600 * 1000))
    let hours = Math.floor((post.timeLeft % (24 * 3600 * 1000)) / (3600 * 1000))
    let minutes = Math.ceil((post.timeLeft % (3600 * 1000)) / (60 * 1000))
    let bountyInETH = post.bounty / 1000000000000000000
    if (show_link) {
      return tag('li', {display: "inline-block", class: "post-block"}, [
        tag('div', {class: "post-state-" + post.state}, ''),
        tag('div', {class: 'meta'}, [
          tag('div', {class: 'left_title'}, [
              tag('h1', {class: "q-title"}, bountyInETH + " ETH"),
              tag('h2', {class: "q-description"}, "Time Left: " + days + " days, " + hours + " hrs, " + minutes + " mins"),
              tag('h5', {class: "q-details"}, post.askerAddr), 
              ]),
          tag('div', {class: 'right_title'}, [
              tag('h1', {class: "q-title"}, post.title),
              tag('h3', {class: "q-description"}, post.body),
              tag('a', {class: "q-details", href: 'question_view.html?qid=' + post._id}, 'See answers >')
            ]),
        ]),
      ]);
    } else {
      return tag('li', {display: "inline-block", class: "question"}, [
        tag('div', {class: 'meta'}, [
          tag('div', {class: 'left_title'}, [
              tag('h1', {}, bountyInETH + " ETH"),
              tag('h5', {}, post.askerAddr)
              ]),
          tag('div', {class: 'right_title'}, [
              tag('h1', {}, post.title),
              tag('h3', {}, post.body)
            ]),
        ]),
      ]);
    }
  };

  Templates.renderQuestion = function(post) {
    console.log("renderingQuestion")
    answer_tags = [];
    for (answer of post.answers) {
      answer_tags.push(tag('h3', {class: 'left_answer'}, answer.upvotes + '^'));
      answer_tags.push(tag('p', {class: 'left_answer'}, answer.user_id));
      answer_tags.push(tag('p', {class: 'right_answer'}, answer.text));
      answer_tags.push(tag('br', {}, ''))
    }
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
        tag('div', {}, answer_tags)
      ]),

    ]);
  }

  /*
    <ul id="answers_list"  list-style="none">
        <li> 
          <div class="answer_box">
            <div class="left_column"> 
              <p> Upvotes: 30</p>
              <input type="submit" name="upvote" value="upvote" />
            </div>
            <div class="right_column"> 
              <p> Lorem Ipsum </p>
            </div> 
          </div>
        </li>
        <li> Jayson Tatum is a baller </li>
        <li> Free Markelle Fultz </li>
    </ul>
  */

  Templates.renderAnswer = function(answer, canUpvote, isOpen) {
    console.log(answer.voters);
    console.log(answer.voters.length);
    console.log(answer);

    var upvote_tags = [tag('p', {class: "upvote_count " + answer._id}, "Upvotes: " + answer.voters.length)] 
    if (canUpvote && isOpen) { 
      upvote_tags.push(tag('input', {type:"submit", name: "upvote" + answer._id, value: "Upvote", class: answer._id, onclick: "upvoteClicked(this)"}))
    } else if (!canUpvote && isOpen) {
      upvote_tags.push(tag('p', {}, "Upvoting Disabled"))
    } 
    
    return tag('li', {display: "inline-block", style:"display: flex;"}, [
      tag('div', {class: "is-winner-" + answer.isWinner}, ''),
      tag('div', {class: "answer_box"}, [
        tag('div', {class: "left_column"}, upvote_tags), 
        tag('div', {class: "right_column"}, 
          tag('p', {}, answer.body)
        )
      ])
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
