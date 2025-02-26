// *** - Attaches event listeners after JS is loaded.
$(document).on('turbolinks:load', function() {
  attachListeners();
});

// (start) JS Review Class
class Review {
  constructor(id, title, rating, beerName, text) {
    this.id = id;
    this.title = title;
    this.rating = rating;
    this.beerName = beerName;
    this.text = text;
  }
}
// *** - Appends a users' latest review to a review index div on the new review page.
Review.prototype.displayLatestReview = function() {
  let reviewHtml = `<li><strong>${this.title}</strong> - ${this.beerName}</li>`
  return reviewHtml;
}

// *** - Displays all the reviews for a beer on beer show view.
Review.prototype.displayBeerReviews = function() {
  let reviewHtml = `<li><strong>${this.title}</strong> - ${this.text}</li> <br />`
  return reviewHtml;
}

// *** - Displays all the reviews for a user on user show view.
Review.prototype.displayUserReviews = function(userId) {
  let reviewHtml = `<li><strong>${this.title}</strong> - ${this.beerName} <button onClick="getUserReview(${userId}, ${this.id})">See Review</button></li><br />`
  return reviewHtml;
}

// *** - Displays a single review/go back/review edit button, on user show view.
Review.prototype.displayUserReview = function() {
  let userId = $('ol')[0].id
  let reviewHtml = `<h2>${this.title}</h2> <p>${this.text}</p> <button onClick=getUserReviews(${userId})>Go Back</button><button><a style="color:black; text-decoration:none" href="/users/${userId}/reviews/${this.id}/edit">Edit Review</a></button>`
  reviewHtml += `<button><a style="color:black; text-decoration:none" data-confirm="Are you sure?" data-method="delete" href="/users/${userId}/reviews/${this.id}" rel="nofollow">Delete Review</a></button>`
  return reviewHtml;
}
// (end) JS Review Class

// *** - Gets a beers' reviews and apends to the DOM.
function getBeerReviews(id) {
  $.get(`/beers/${id}/reviews.json`, function(json) {
    $('#beer-review-box').empty();
    if(json.data.length == 0) {
      alert("No Reviews For This Beer!")
    } else {
      json.data.forEach(function(reviewObj) {
        let jsReviewObj = new Review(reviewObj.id, reviewObj.attributes.title, reviewObj.attributes.rating, reviewObj.relationships.beer.data.name, reviewObj.attributes.text)
        let html = jsReviewObj.displayBeerReviews()
        $('#beer-review-box').append(html)
      });
    }
  });
}
// *** - Renders the clear button that is on the show page of a user with reviews.
const clearButton = () => {
  $('.user-reviews-box').append("<button type='button' class='clear-reviews-button'>Clear Reviews</button>")
}

function getUserReviews(userId) {
  $.get(`/users/${userId}/reviews.json`, function(json) {
    $('.user-reviews-box').empty();
    if(json.data.length === 0) {
      alert("You Have Not Written Any Reviews Yet!")
    }

    json.data.forEach(function(reviewObj) {
      let jsReviewObj = new Review(reviewObj.id, reviewObj.attributes.title, reviewObj.attributes.rating, reviewObj.relationships.beer.data.name, reviewObj.attributes.text)
      let html = jsReviewObj.displayUserReviews(userId);
      $('.user-reviews-box').append(html);
    });

    if(json.data.length !== 0) {
      clearButton();
    };
  });
}
// *** - Gets a specific user review and apends to the DOM.
function getUserReview(userId, reviewId) {
  $.get(`/users/${userId}/reviews/${reviewId}.json`, function(json) {
    $('.user-reviews-box').empty();
    let jsReviewObj = new Review(json.data.id, json.data.attributes.title, json.data.attributes.rating, json.data.relationships.beer.data.name, json.data.attributes.text)
    let html = jsReviewObj.displayUserReview(json);
    $('.user-reviews-box').append(html);
  });
}


function reviewNewRefresh() {
  document.getElementById("new_review").reset()
  $(".form-submit-button" ).prop( "disabled", false );
}

// *** - Zippers all event listeners into one function.
function attachListeners() {

// *** - Event listener for 'see review' button on the user show page.
  $('.see-review').on('click', function(e) {
    let id = this.id
    e.preventDefault();
    getBeerReviews(id);
  });
// *** - Event listener for the 'show beer reviews' button on the beers index page and show page.
  $('.beer-show-page-reviews').on('click', function(e) {
    let id = this.id
    e.preventDefault();
    getBeerReviews(id);
  });
// *** - Event listener for 'see users' review' button on the user show page.
  $('.user-reviews-link').on('click', function(e) {
    let id = this.id
    e.preventDefault();
    getUserReviews(id);
  });
// *** - Event listener for clear button on the user show page.
  $('.user-reviews-box').on('click', '.clear-reviews-button', function(e) {
    $('.user-reviews-box').empty();
  });

// *** - Submit review event listener on the new review page.
  $('#new_review').submit(function(e) {
    e.preventDefault();
    let userId = document.getElementsByClassName("review-index-box")[0].id
    let state = $(this).serialize();
    $.post(`/users/${userId}/reviews`, state).done(function(data) {
      if(typeof data === "object") {
        let reviewId = data.data.id
        let reviewTitle = data.data.attributes.title;
        let reviewRating = data.data.attributes.rating;
        let reviewBeerName = data.data.relationships.beer.data.name;
        let reviewText = data.data.attributes.text;
        let jsReviewObj = new Review(reviewId, reviewTitle, reviewRating, reviewBeerName, reviewText);
        let html = jsReviewObj.displayLatestReview();
        $('.review-index-box').append(html);
        reviewNewRefresh();
      } else {
        alert("Must Enter a Title, Rating and Beer-Name to Submit!")
        // reviewNewRefresh();
        $(".form-submit-button" ).prop( "disabled", false );
      }
    });
  });

// *** - Loads review history on the new review page.
  if($("#new_review").length > 0){
    $(document).ready(function(e) {
      let userId = document.getElementsByClassName("review-index-box")[0].id
      $.get(`/users/${userId}/reviews.json`, function(json) {
        json.data.forEach(function(reviewObj) {
          let jsReviewObj = new Review(reviewObj.id, reviewObj.attributes.title, reviewObj.attributes.rating, reviewObj.relationships.beer.data.name, reviewObj.attributes.text)
          $('.review-index-box').append(`<li><strong>${jsReviewObj.title}</strong> - ${jsReviewObj.beerName}</li>`);
        });
      });
    });
  }
}
