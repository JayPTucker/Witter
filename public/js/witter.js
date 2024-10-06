jQuery(function() {
    $.get("/api/user_data").then(function(user) {

        $(".member-name").text(user.username);
        var newWitForm = $("form.new-wit");
        var authorInput = user.username;
        var bodyInput = $("#wit-input");
        var imageInput = $("#image-input");
        var newWitProfilePic = user.profilePicture;
        var imageInputPreview = $("#image-preview")

        let offset = 0;  // Start at the first page
        const limit = 10;  // Load 10 wits at a time
        let loading = false;  // To prevent multiple calls at once
        let allWitsLoaded = false;  // Flag to check if all wits are loaded

        // =============================================
        // LOAD CURRENT PROFILE PIC
        // =============================================
        
        async function loadCurrentProfilePic() {
            var row = $("#newWit-profilePic");
            var rightProfileMenu = $("#rightProfileMenu");

            // Clear any existing profile pictures to avoid duplicates
            row.empty();
            rightProfileMenu.empty();

            if (!newWitProfilePic) {
                // console.log("No Profile Pic Set in the DB, using Default");
                row.append(`<img class="Wit-profilePic" src="/img/defaultProfilePic.png"></img>`);
                rightProfileMenu.append(`<img class="currentProfilePic" src="/img/defaultProfilePic.png"></img>`);
            } else {
                // console.log("Profile Pic is Set in the DB");
                row.append(`<img class="Wit-profilePic" src="${newWitProfilePic}"></img>`);
                rightProfileMenu.append(`<img class="currentProfilePic" src="${newWitProfilePic}"></img>`);
            }
        }

        // Call the function to load the current profile picture
        loadCurrentProfilePic(); 

        // =============================================
        // =============================================

        // Function to change profile picture
        function changeProfilePic(newProfilePic) {
            var formData = new FormData();
            formData.append("username", user.username);
            formData.append("profilePicture", newProfilePic);

            $.ajax({
                url: '/api/changeProfilePic',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(updatedUser) {
                    // Update the local user data
                    newWitProfilePic = updatedUser.profilePicture;
                    
                    // Reload the profile picture to reflect changes
                    loadCurrentProfilePic();
                },
                error: function(err) {
                    console.log("Error changing profile picture:", err);
                }
            });
        }

        $("#profilePicInput").on("change", function() {
            var selectedFile = this.files[0];
            if (selectedFile) {
                changeProfilePic(selectedFile);
            }
        });


        // =========================
        // LOAD WITS FUNCTION (WITH PAGINATION)
        // =========================
        async function loadWits() {
            if (loading || allWitsLoaded) return;  // Prevent loading more while a request is in progress
            loading = true;

            try {
                const data = await $.get(`/api/all_wits?limit=${limit}&offset=${offset}`);
                
                if (data.length > 0) {
                    offset += data.length;  // Increment the offset by the number of wits loaded

                    for (var i = 0; i < data.length; i++) {
                        var likesArray;
                        try {
                            likesArray = JSON.parse(data[i].likes || '[]');
                        } catch (error) {
                            likesArray = [];
                        }

                        var likesCount = likesArray.length;

                        var row = $(`<div class="wit-row col-md-12" id="wit-${data[i].id}"></div>`);

                        row.append(`
                            <div class="row">
                                <div class="col-md-2" id="witProfilePic"></div>
                                <div class="col-md-9">
                                    <h4 class="wit-author">@${data[i].author}</h4>
                                    <p class="wit-date">${moment(data[i].createdAt).format("h:mma on dddd")} </p>
                                    <p class="wit-body">${data[i].body}</p>
                                    <p class="imgAttachmentDiv"></p>
                                    <button type="button" data-wit-id="${data[i].id}" class="wit-like-btn wit-like-btn-${data[i].id} btn btn-default btn-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                                            <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                                        </svg>
                                        ${likesCount}
                                    </button>
                                </div>
                                <div class="col-md-1">
                                    <div class="dropdown-container"></div>
                                </div>
                            </div>
                        `);

                        // Appending the row
                        $("#wits-area").append(row);

                        // FIND THE PROFILE PIC - Await the result to ensure proper order
                        await handleProfilePicture(data[i], row);

                        row.find('.wit-like-btn').on('click', function () {
                            likePost(this.dataset.witId, user.username, row);
                        });

                        const lowercaseUsername = user.username.toLowerCase();
                        if (data[i].likes && data[i].likes.includes(lowercaseUsername)) {
                            row.find('.wit-like-btn').css('background-color', 'red').css('color', 'white');
                        }

                        const dropdownHtml = await renderDropDown(data[i], row);
                        row.find('.dropdown-container').html(dropdownHtml);

                        row.find('.edit-button').on('click', function () {
                            handleEditButtonClick(this.dataset.witId, user.username, row);
                        });

                        row.find('.delete-button').on('click', function () {
                            handleDeleteButtonClick(this.dataset.witId, user.username, row);
                        });

                        if (data[i].image) {
                            var imageUrl = data[i].image;
                            row.find(".imgAttachmentDiv").html(`<img src="${imageUrl}" alt="Wit Image" class="wit-image">`);
                        }
                    }
                } else {
                    allWitsLoaded = true;  // No more wits to load
                }
            } catch (error) {
                console.error("Error loading wits:", error);
            } finally {
                loading = false;  // Allow further loading
            }
        }

        // =========================
        // IMPROVED INFINITE SCROLL HANDLER
        // =========================
        $(window).on("scroll", function () {
            const scrollPosition = $(window).scrollTop() + $(window).height();
            const documentHeight = $(document).height();
            // console.log("Scroll Position:", scrollPosition);
            // console.log("Document Height:", documentHeight);    

            // Trigger loadWits if scrolled near the bottom of the page (within 100px)
            if (scrollPosition >= documentHeight - -700 && !loading && !allWitsLoaded) {
                // Chose 700 cause it's the closest to the bottom of the page.
                loadWits();  // Load more wits when scrolling near the bottom
            }
        });

        // Load the initial batch of wits when the page loads
        $(document).ready(function () {
            loadWits();  // Load the first batch of wits
        });

        // SEPARATE FUNCTION FOR LOADING PROFILE PICS SO THEY ARE NOT SKIPPED
        async function handleProfilePicture(wit, row) {
            try {
                const result = await findProfilePicture(wit.author);
                if (!result) {
                    row.find('#witProfilePic').html(`<img class="Wit-profilePic" src="/img/defaultProfilePic.png"></img>`);
                } else {
                    row.find('#witProfilePic').html(`<img class="Wit-profilePic" src="${result}"></img>`);
                }
            } catch (error) {
                console.error("Error fetching profile picture:", error);
            }
        };

    // ========================================
    // LOADING TRENDING WITS
    // ========================================

    function loadTrendingWits() {
        $.get("/api/top_wits").then(function(data) {
            if (data.length !== 0) {
                // Create an array of promises for fetching profile pictures
                const profilePicturePromises = data.map(wit => findProfilePicture(wit.author));

                // Wait for all promises to resolve
                Promise.all(profilePicturePromises)
                .then(profilePictures => {
                    for (var i = 0; i < data.length; i++) {
                        // Parse the likes string into a JSON array if it's not empty
                        var likesArray;
                        try {
                            likesArray = JSON.parse(data[i].likes || '[]');
                        } catch (error) {
                            console.error("Error parsing likes:", error);
                            likesArray = [];
                        }

                        // Get the length of the array
                        var likesCount = likesArray.length;

                        // var mainData = data[i];
                        var row = $(`<div class="T-wit-row col-md-12" id="wit-${data[i].id}"></div>`);
                        row.append(`
                        <div class="row">

                            <div class="col-md-3" id="T-witProfilePic">
                            
                            </div>
            
                            <div class="col-md-9">
                                <h4 class="T-wit-author">@${data[i].author}</h4><p class="T-wit-date">${moment(data[i].createdAt).format("h:mma on dddd")} </p>
                                <p class="T-wit-body">${data[i].body}</p>
                                <p class="imgAttachmentDiv"></p>
                                <button type="button" data-wit-id="${data[i].id}" class="wit-like-btn btn btn-default btn-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                                        <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                                    </svg>

                                    ${likesCount}

                                </button>
                            </div>

                        </div>
                        `);

                        $("#trendingWits").prepend(row);

                        // Append profile pic to the page using the pre-fetched profilePictures array
                        const profilePic = profilePictures[i];
                        if (!profilePic) {
                            row.find('#T-witProfilePic').html(`<img class="T-Wit-profilePic" src="/img/defaultProfilePic.png"></img>`);
                        } else {
                            row.find('#T-witProfilePic').html(`<img class="T-Wit-profilePic" src="${profilePic}"></img>`);
                        }

                        // Attach click event handler to the like button
                        row.find('.wit-like-btn').on('click', function () {
                            // Call the function to handle the like button click
                            likePost(this.dataset.witId, user.username, row);
                        });

                        // ======================================
                        // ADDING IMAGES TO THE PAGE
                        if (data[i].image) {
                            
                            var imageUrl = data[i].image;
                            row.find(".imgAttachmentDiv").html(`<img src="${imageUrl}" alt="Wit Image" class="wit-image">`);
                        }

                        $("#T-wits-area").prepend(row);
                        // ======================================


                        const lowercaseUsername = user.username.toLowerCase();

                        // Checks if the user has liked the wit
                        if (data[i].likes && data[i].likes.includes(lowercaseUsername)) {
                            row.find('.wit-like-btn').css('background-color', 'red');
                            row.find('.wit-like-btn').css('color', 'white');
                        }

                    }
                })
            } else {
                return;
            }
        });
    }

    loadTrendingWits();

    // ==================================================
    // ==================================================
    // WHEN THE "WIT" BUTTON IS PRESSED
    // ==================================================

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
            imageInputPreview.attr("src", "").hide()

            
        }

        return false; // Add this line to prevent default form submission behavior
    });

    function createWitFunction(formData) {
        $.ajax({
            url: "/api/witter",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {    
                // Clears out page so Wits are no doubled
                $("#wits-area").html("")

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

// ==================================================
// ==================================================

function findProfilePicture(author) {
    return new Promise((resolve, reject) => {
        // Fetch the profile picture for the author
        $.get(`/api/profilePicture/${author}`)
            .then(response => {
                resolve(response.profilePicture);
            })
            .catch(error => {
                console.log("Error fetching profile picture:", error);
                reject(error);
            });
    });
}

function likePost(witId, username) {
    // console.log("Like button has been pressed");
    // console.log(witId)
    // console.log(username)
    var row = $(`#wit-${witId}`);

    $.ajax({
        method: 'POST',
        url: `/api/wits/${witId}/like`,
        data: {username: username},
        success: function (response) {
            var witBtn = (".wit-like-btn-" + witId)

            // Update the like button with the new like count
            row.find(witBtn).html(`
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                    <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                </svg>
                ${response.numLikes}
            `);

            // Update the like button style if needed
            if (response.userAlreadyLiked) {
                row.find(witBtn).css('background-color', 'red');
                row.find(witBtn).css('color', 'white');
            } else {
                row.find(witBtn).css('background-color', 'white');
                row.find(witBtn).css('color', 'black');
            }
        },        
        error: function(error) {
            console.error('Error within likePost function:', error)
        }
    })
}

function renderDropDown(witData, row) {
    // console.log("Rendering dropdown for wit:", witData);

    return $.get("/api/user_data").then(function(userData) {
        // console.log("User data:", userData);

        var authorInput = userData.username;
        var currentDate = moment();
        var witCreationTime = moment(witData.createdAt);
        var timeDifference = currentDate.diff(witCreationTime, 'minutes'); // Difference in minutes

        if (authorInput !== witData.author) {
            // console.log("Author mismatch, returning empty string");
            return "";
        } else if (timeDifference > 2) {
            // console.log("Rendering dropdown for wit created more than 2 minutes ago");
            return `
                <div class="dropdown">
                    <button class="dropbtn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                        </svg>
                    </button>
                    <div class="dropdown-content">
                        <a class="delete-button" data-wit-id="${witData.id}" href="#">Delete</a>
                    </div>
                </div>`;
        } else if (authorInput === witData.author) {
            console.log("Rendering dropdown for wit created by the current user");
            return `
            <div class="dropdown">
                <button class="dropbtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                    </svg>
                </button>
                <div class="dropdown-content">
                    <a class="edit-button" data-wit-id="${witData.id}" href="#">Edit</a>
                    <a class="delete-button" data-wit-id="${witData.id}" href="#">Delete</a>
                </div>
            </div>`;
       }
    });
}


function handleDeleteButtonClick(witData, username) {
    // console.log("THIS IS THE WITDATA: " + witData)
    // Use a confirm dialog for user confirmation
    var userConfirmation = confirm("Are you sure you want to delete this Wit?");

    // Check if the user clicked "OK" (result is true) or "Cancel" (result is false)
    if (userConfirmation) {
        // User clicked "OK," proceed with the delete action
        console.log("User confirmed deletion");
        window.location.reload();
        // Call the function to handle the delete button click
    } else {
        // User clicked "Cancel" or closed the dialog, do nothing or provide feedback
        console.log("User canceled deletion");
        return;
        // You can choose to do nothing or provide feedback to the user
    }

    $.ajax({
        method: 'POST',
        url: `/api/wits/${witData}/delete`,
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
})

function handleEditButtonClick(witData, username) {
    console.log("edit button");

    // Use a confirm dialog for user confirmation
    var editPrompt = prompt("What would you like to change this wit to?")

    // Check if the user clicked "OK" (result is true) or "Cancel" (result is false)
    if (editPrompt) {
        // User clicked "OK," proceed with the delete action
        console.log("User confirmed edit");
        // Call the function to handle the delete button click
    } else {
        // User clicked "Cancel" or closed the dialog, do nothing or provide feedback
        console.log("User canceled editing");
        return;
        // You can choose to do nothing or provide feedback to the user
    }

    $.ajax({
        method: 'POST',
        url: `/api/wits/${witData}/edit`,
        data: {editPrompt},
        success: function (response) {
            console.log("Wit has been edited successfully")
            alert("Wit has been edited successfully")
            window.location.reload();
        }, 
        error: function(error) {
            console.error('Error within handleEditButton function:', error)
        }
    })
}

jQuery(function() {
    // Check if Geolocation is supported
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Geolocation is not supported by this browser.");
    }

    // If geolocation is successful
    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var apiKey = "46ca71a108aa34e0e63f33a3643552ba";
        var apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

        // AJAX request to OpenWeatherMap
        $.ajax({
            url: apiUrl,
            type: "GET",
            success: function(data) {
                var temperature = data.main.temp;
                var city = data.name;
                var weatherIconCode = data.weather[0].icon; // Get the icon code
                var weatherIconUrl = `https://openweathermap.org/img/wn/${weatherIconCode}@2x.png`; // Construct icon URL

                // Display the temperature and city name
                $("#temp").text(`The temperature in ${city} is ${temperature}°F`);

                // Display the weather icon
                $("#weather-icon").attr("src", weatherIconUrl).show();
            },
            error: function(error) {
                console.log("Error fetching weather data:", error);
                $("#temp").text("Could not retrieve weather data.");
            }
        });
    }

    // If geolocation fails
    function error() {
        alert("Unable to retrieve your location.");
        $("#temp").text("Location access denied. Cannot fetch weather.");
    }  
});