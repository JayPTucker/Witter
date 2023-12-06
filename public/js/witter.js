$(document).ready(function() {
  $.get("/api/user_data").then(function(data) {
      $(".member-name").text(data.username);

      var newWitForm = $("form.new-wit");
      var authorInput = data.username;
      var bodyInput = $("input#wit-input");
      var imageInput = $("#image-input");

        newWitForm.on("submit", function(event) {
            event.preventDefault();

            if (bodyInput.val().trim() === "" && imageInput[0].files[0] == null) {
                console.log("no body OR photo")
                alert("Please enter something into the text box or choose an image.")

            } else {
                console.log("has body OR photo")
            
                // Create FormData object
                var formData = new FormData();
                formData.append("author", authorInput);
                formData.append("body", bodyInput.val().trim());

                // Get the selected file from the input
                if (imageInput[0].files.length > 0) {
                    formData.append("image", imageInput[0].files[0]);
                }

                    createWitFunction(formData);
                    bodyInput.val("");
                    imageInput.val(""); // Clear the file input
            }
        });

      function createWitFunction(formData) {
        $.ajax({
            url: "/api/witter",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                // Display the wit immediately after creating it
                displayWit(response);
            },
            error: function (err) {
                console.log(err.responseJSON);
                console.log(500);
            }
        });
    }
    
      function displayWit(wit) {
        $.get("/api/user_data").then(function (data) {
            var row = $(`<div class="wit row">`);
            row.append(`<div class="col-6"><p class="wit-author">@${data.username}</div>`);
            row.append(`<div class="col-6"><p class="wit-date">${moment(wit.createdAt).format("h:mma on dddd")} </p></div>`);
            row.append(`</div>`);
            row.append(`<p>${wit.body}</p>`);
    
            // Check if there is an image
            if (wit.image) {
                // Display the image in the new row
                displayImage(wit.image, row);
            }
    
            $("#wits-area").prepend(row);
        });
      }
  
      function displayImage(imageFilename, row) {
          // Assuming images are stored in the "public/uploads/" directory
          var imageUrl = `/uploads/${imageFilename}`;
          var imageElement = $(`<img src="${imageUrl}" alt="Wit Image" class="wit-image">`);
          row.append(imageElement);
      }

      function handleNewWitErr(err) {
          console.log(err.responseJSON);
          console.log(500);
      }

      // Ensure the displayImage function is globally available
      window.displayImage = displayImage;
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
                  // Display the image in the existing row
                  displayImage(data[i].image, row);
              }

              $("#wits-area").prepend(row);
          }
      }
  });
});
