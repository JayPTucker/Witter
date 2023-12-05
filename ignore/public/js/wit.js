/* global moment */

// When the page loads, grab and display all of our Wits
$.get("/api/all", function(data) {

  if (data.length !== 0) {

    for (var i = 0; i < data.length; i++) {

      var row = $("<div>");
      row.addClass("wit");

      row.append("<p>" + data[i].author + " Witted... </p>");
      row.append("<p>" + data[i].body + "</p>");
      row.append("<p>At " + moment(data[i].created_at).format("h:mma on dddd") + "</p>");

      $("#wit-area").prepend(row);

    }

  }

});

// When user wits (clicks addBtn)
$("#wit-submit").on("click", function(event) {
  event.preventDefault();

  // Make a newWit object
  var newWit = {
    author: $("#author").val().trim(),
    body: $("#wit-box").val().trim(),
    created_at: moment().format("YYYY-MM-DD HH:mm:ss")
  };

  console.log(newWit);

  // Send an AJAX POST-request with jQuery
  $.post("/api/new", newWit)
    // On success, run the following code
    .then(function() {

      var row = $("<div>");
      row.addClass("wit");

      row.append("<p>" + newWit.author + " Witted: </p>");
      row.append("<p>" + newWit.body + "</p>");
      row.append("<p>At " + moment(newWit.created_at).format("h:mma on dddd") + "</p>");

      $("#wit-area").prepend(row);

    });

  // Empty each input box by replacing the value with an empty string
  $("#author").val("");
  $("#wit-box").val("");
});
