$(document).ready(function() {

$.get("/api/user_data").then(function(data) {
    $(".member-name").text(data.username);

    var newWitForm = $("form.new-wit");
    var authorInput = data.username;
    var bodyInput = $("input#wit-input");
    var imageInput = $("#image-input");

    function loadWits() {

        $.get("/api/all_wits").then(function (data) {
            if (data.length !== 0) {
                for (var i = 0; i < data.length; i++) {
                    displayWit(data[i]);
                }
            }
        });
    }

    loadWits();


    newWitForm.on("submit", function(event) {
        event.preventDefault();

        if (bodyInput.val().trim() === "" && imageInput[0].files[0] == null) {
            alert("Please enter something into the text box or choose an image.")

        } else {        
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
    
                // Reload all wits to include the new one
                loadWits();
            },
            error: function (err) {
                console.log(err.responseJSON);
                console.log(500);
            }
        });
    }    
});

function displayWit(wit) {
    $.get("/api/user_data").then(function (data) {
        var row = $(`<div id="wit-${wit.id}" class="wit-row"></div>`);
        row.append(`<div class="col-6"><p class="wit-author">@${wit.author}</p></div>`);
        row.append(`<div class="col-6"><p class="wit-date">${moment(wit.createdAt).format("h:mma on dddd")} </p></div>`);
        row.append(`<button class="like-button" data-wit-id="${wit.id}">Like</button>`);
        row.append(`<p class="like-count">Likes: ${getLikeCount(wit.likes)} -</p>`); // Container for like count
        row.append(`</div>`);
        row.append(`<p>${wit.body}</p>`);
        // Renders our Dropdown menu if the user is logged into the account the wits belong to
        renderDropDown(wit, row).then((dropdownHtml) => {
            row.append(dropdownHtml);
            row.find('.delete-button').on('click', function () {
                handleDeleteButtonClick(wit.id, data.username, row);
            });
        });
        // Check if there is an image
        if (wit.image) {
            // Display the image in the new row
            displayImage(wit.image, row);
        }

        // && Checks to see if the array is empty or not or if it includes the username
        if (wit.likes && wit.likes.includes(data.username)) {
            row.find('.like-button').css('background-color', 'red');
            row.find('.like-button').css('color', 'white');
        } 

        $("#wits-area").prepend(row);

        // Attach click event handler to the like button
        row.find('.like-button').on('click', function () {
            // Call the function to handle the like button click
            handleLikeButtonClick(wit.id, data.username, row);
        });
    });
}

// Function to get the number of likes from the JSON string
function getLikeCount(likes) {
    try {
        const likesArray = JSON.parse(likes);

        return likesArray ? likesArray.length : 0;
    } catch (error) {
        console.error("Error parsing likes:", error);
        return 0; // Return 0 if there is an error parsing the likes
    }
}

function renderDropDown(wit, row) {
    return $.get("/api/user_data").then(function(data) {
        var authorInput = data.username;

        if (authorInput !== wit.author) {
            return ""; // Return an empty string if not matching user
        } else if (authorInput === wit.author) {
            return `
                <div class="dropdown">
                    <button class="dropbtn">Options</button>
                    <div class="dropdown-content">
                        <a class="edit-button" href="#">Edit</a>
                        <a class="delete-button" href="#">Delete</a>
                    </div>
                </div>`;
        }
    });
}

function displayImage(imageFilename, row) {
    // Assuming images are stored in the "public/uploads/" directory
    var imageUrl = `/uploads/${imageFilename}`;
    var imageElement = $(`<img src="${imageUrl}" alt="Wit Image" class="wit-image">`);
    row.append(imageElement);
}

    // Ensure the displayImage function is globally available
    window.displayImage = displayImage;
});

function handleLikeButtonClick(witId, username) {
    $.ajax({
        method: 'POST',
        url: `/api/wits/${witId}/like`,
        data: { username: username },
        success: function (response) {
            // Optionally update the UI to reflect the like action
            console.log(`User ${username} liked wit with ID ${witId}`);
        },
        error: function (error) {
            console.error('Error liking wit:', error);
        }
    });
}

function handleDeleteButtonClick(witId, username) {
    // Use a confirm dialog for user confirmation
    var userConfirmation = confirm("Are you sure you want to delete this Wit?");

    // Check if the user clicked "OK" (result is true) or "Cancel" (result is false)
    if (userConfirmation) {
        // User clicked "OK," proceed with the delete action
        console.log("User confirmed deletion");
        // Call the function to handle the delete button click
    } else {
        // User clicked "Cancel" or closed the dialog, do nothing or provide feedback
        console.log("User canceled deletion");
        return;
        // You can choose to do nothing or provide feedback to the user
    }

    $.ajax({
        method: 'POST',
        url: `/api/wits/${witId}/delete`,
        data: {username: username},
        success: function (response) {
            console.log("Wit has been deleted successfully")
            alert("Wit has been deleted successfully")
        }, 
        error: function(error) {
            console.error('Error within handleDeleteButtonClick function:', error)
        }
    })
}