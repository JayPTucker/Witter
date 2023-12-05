$(document).ready(function() {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page

  $.get("/api/user_data").then(function(data) {
      $(".member-name").text(data.username);

      var newWitForm = $("form.new-wit");
      var authorInput = (data.username);
      var bodyInput = $("input#wit-input");
      var imageInput = $("#image-input");

      newWitForm.on("submit", function(event) {
          event.preventDefault();

          // Create FormData object
          var formData = new FormData();
          formData.append("author", authorInput);
          formData.append("body", bodyInput.val().trim());

          // Get the selected file from the input
          if (imageInput[0].files.length > 0) {
              formData.append("image", imageInput[0].files[0]);
          }

          console.log("FormData:", formData);

          createWitFunction(formData);
          bodyInput.val("");
          imageInput.val(""); // Clear the file input
      });

      function createWitFunction(formData) {
          $.ajax({
              url: "/api/witter",
              type: "POST",
              data: formData,
              processData: false,
              contentType: false,
              success: function(response) {
                  var row = $(`<div class="wit row">`);
                  row.append(`<div class="col-6"><p class="wit-author">@${formData.get("author")}</div>`);
                  row.append(`<div class="col-6"><p class="wit-date">${moment().format("h:mma on dddd")} </p></div>`);
                  row.append(`</div>`);
                  row.append(`<p>${formData.get("body")}</p>`);
  
                  $("#wits-area").prepend(row);
              },
              error: function(err) {
                  console.log(err.responseJSON);
                  console.log(500);
              }
          });
      }

      // If there's an error:
      function handleNewWitErr(err) {
          console.log(err.responseJSON);
          console.log(500);
      }
  });

  $.get("/api/all_wits").then(function(data) {
    if (data.length !== 0) {
        for (var i = 0; i < data.length; i++) {
            var row = $(`<div class="wit row">`);
            row.append(`<div class="col-6"><p class="wit-author">@${data[i].author}</div>`);
            row.append(`<div class="col-6"><p class="wit-date">${moment(data[i].createdAt).format("h:mma on dddd")} </p></div>`);
            row.append(`</div>`);
            row.append(`<p>${data[i].body}</p>`);

            // Check if there is an image
            if (data[i].image) {
                // Assuming images are stored in the "public/uploads/" directory
                var imageUrl = `/uploads/${data[i].image}`;
                row.append(`<img src="${imageUrl}" alt="Wit Image" class="wit-image">`);
            }

            $("#wits-area").prepend(row);
        }
    }
  });
});
