let loggedInUser = '';  // Define globally
let offset = 0;
const limit = 10;  // Set limit to 10 wits per load
let loading = false;
let allWitsLoaded = false;

// Fetch the logged-in user's username on page load
$.get('/api/user_data', function (response) {
    if (response.username) {
        loggedInUser = response.username;
    }
});

$(".home-button").css("background-color", "rgb(34, 67, 97)").css("border", "3px solid white")


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
    // RENDERING A SINGLE ROW
    // =============================================
    async function renderWitRow(witData, user) {
        let likesArray = [];
        try {
            likesArray = JSON.parse(witData.likes || '[]');
        } catch (error) {
            // console.error("Error parsing likes:", error);
        }
        
        const likesCount = likesArray.length;
        
        // Create the wit row
        const row = $(`
            <div class="wit-row col-md-12" id="wit-${witData.id}">
                <div class="row">
                    <div class="col-md-2 wit-img-div" id="witProfilePic-${witData.id}"></div>
                    <div class="col-md-9">
                        <h4 class="wit-author" data-username="${witData.author}">@<span class='clickable'>${witData.author}</span></h4>
                        <a class="following-status">Loading...</a>

                        <div class="popup profile-popup" style="display: none;">
                            <div class="followers-list">
                                <p class="followerAmount" id="follower-count-${witData.id}"></p>
                                <button class="follow-btn follow-btn-${witData.author}">Follow</button>
                                <button class="view-wits-btn wits-btn-${witData.author}">View All Wits by User</button>
                            </div>
                        </div>

                        <p class="wit-date">${moment(witData.createdAt).format("h:mma on MMMM Do, YYYY")}</p>
                        <p class="wit-body">${witData.body}</p>
                        <p class="imgAttachmentDiv"></p>
                        <button type="button" data-wit-id="${witData.id}" class="wit-like-btn wit-like-btn-${witData.id} btn btn-default btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                                <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                            </svg>
                            ${likesCount}
                        </button>

                        <button type="button" data-wit-id="${witData.id}" class="comment-btn btn btn-default btn-sm">
                            Replies (<span class="comment-count" id="comment-count-${witData.id}">0</span>)
                        </button>
                        <div class="comment-section" style="display:none;" id="comment-section-${witData.id}">
                            <textarea placeholder="Add a comment" class="comment-input" maxlength="120"></textarea>
                            <div class="char-counter" id="char-counter-${witData.id}">120 characters remaining</div>
                            <button type="button" data-wit-id="${witData.id}" class="submit-comment-btn btn btn-primary">Reply</button>
                            <div class="comments-list"></div>
                        </div>


                    </div>
                    <div class="col-md-1">
                        <div class="dropdown-container"></div>
                    </div>
                </div>
            </div>
        `);
        
        // Append the row to the wits area
        $("#wits-area").append(row);

        // Handle comment button toggle
        row.find('.comment-btn').on('click', function () {
            $(`#comment-section-${witData.id}`).toggle();
        });

        // Handle submit comment functionality
        row.find('.submit-comment-btn').on('click', function () {
            const commentText = $(this).siblings('.comment-input').val();
            if (commentText) {
                postComment(this.dataset.witId, commentText, user.username);
            }
        });

        // GET API FOR THE COMMENTS OF A POST
        $.ajax({
            method: 'GET',
            url: `/api/wits/${witData.id}/comments`,  // Your new API route to fetch comments
            success: function (comments) {
                const commentsList = $(`#comment-section-${witData.id} .comments-list`);
                comments.forEach(comment => {
                    commentsList.append(`<p class="comment"><strong>@${comment.author}:</strong><br><span class="wit-date">${moment(comment.createdAt).format("h:mma on MMMM Do, YYYY")}</span><br> ${comment.body}</p>`);
                });
                // Update the comment count on the button
                $(`#comment-count-${witData.id}`).text(comments.length);
            },
            error: function (error) {
                console.error('Error fetching comments:', error);
            }
        });

        // Now make the AJAX call to check if the logged-in user is following the author
        $.ajax({
            method: 'GET',
            url: `/api/users/${witData.author}/followers`,  // API endpoint
            success: function (response) {
                const followBtnText = response.followers.includes(loggedInUser) ? 'Following' : '';

                // Update the .following-status button with the correct status
                $(`#wit-${witData.id} .following-status`).text(followBtnText);

                // Handle the follow/unfollow button inside the popup as well
                const popupFollowBtnText = response.followers.includes(loggedInUser) ? 'Unfollow' : 'Follow';
                $(`.follow-btn-${witData.author}`).text(popupFollowBtnText);
            },
            error: function (error) {
                console.error(`Error fetching follower status for ${witData.author}:`, error);
                $(`#wit-${witData.id} .following-status`).text('Error');  // Indicate error if the request fails
            }
        });

        // Event listener for follow/unfollow in the popup or main post
        $(document).on('click', '.following-status', function () {
            let witRow = $(this).closest('.wit-row');
            let username = witRow.find('.wit-author').data('username');
            let isFollowing = $(this).text() === 'Following';

            $.ajax({
                method: isFollowing ? 'DELETE' : 'POST',
                url: `/api/users/${username}/follow`,  // API endpoint for follow/unfollow
                success: function (response) {
                    console.log(`${isFollowing ? 'Unfollowed' : 'Followed'} ${username}`);
                    $(`.following-status`, witRow).text(isFollowing ? 'Not Following' : 'Following');
                    $(`.follow-btn-${username}`).text(isFollowing ? 'Follow' : 'Unfollow');
                },
                error: function (error) {
                    console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} ${username}:`, error);
                }
            });
        });

        // Load profile picture
        await handleProfilePicture(witData, row);

        // Handle like button functionality
        row.find('.wit-like-btn').on('click', function () {
            likePost(this.dataset.witId, user.username, row);
        });

        const lowercaseUsername = user.username.toLowerCase();
        if (likesArray.includes(lowercaseUsername)) {
            row.find('.wit-like-btn').css('background-color', 'red').css('color', 'white');
        }

        // Handle dropdown menu
        const dropdownHtml = await renderDropDown(witData, row);
        row.find('.dropdown-container').html(dropdownHtml);

        // Event listeners for edit and delete buttons
        row.find('.edit-button').on('click', function () {
            handleEditButtonClick(this.dataset.witId, user.username, row);
        });
        row.find('.delete-button').on('click', function () {
            handleDeleteButtonClick(this.dataset.witId, user.username, row);
        });

        // Handle follow button functionality
        row.find('.follow-btn').on('click', function () {
            const targetUsername = $(this).closest('.popup').siblings('.wit-author').data('username');
            followPost(targetUsername, user.username);
        });

        // Load image if available
        if (witData.image) {
            row.find(".imgAttachmentDiv").html(`<img src="${witData.image}" alt="Wit Image" class="wit-image">`);
        }

        // ==================================
        // VIEW WITS BUTTON
        // ==================================
        // Ensure the event is not bound multiple times
        $(document).off('click', '.view-wits-btn').on('click', '.view-wits-btn', function () {

            const username = $(this).closest('.popup').siblings('.wit-author').data('username'); // Get the username
            const limit = 5;  // Load 5 wits at a time
            const offset = 0; // Start from the first wit

            // Make an AJAX call to fetch the first 5 wits by the user
            $.ajax({
                method: 'GET',
                url: `/api/users/${username}/wits?limit=${limit}&offset=${offset}`,
                success: function (wits) {
                    // Clear the current wits area if it's the first load
                    if (offset === 0) {
                        $('#wits-area').empty();
                    }
                    // Loop through the fetched wits and render each wit
                    wits.forEach(witData => {
                        renderWitRow(witData, { username });  // Reuse your existing renderWitRow function
                    });

                    // Optional: Add a "Load More" button if there are more wits to load
                    if (wits.length === limit) {
                        // If the "Load More" button already exists, update its offset
                        if ($('.load-more-btn').length) {
                            $('.load-more-btn').data('offset', offset + limit);
                        } else {
                            // Otherwise, append a new "Load More" button
                            $('#wits-area').append(`<button class="load-more-btn" data-username="${username}" data-offset="${limit}">Load More Wits</button>`);
                        }
                    }

                    var navbar = $(".nav-buttons")
                    navbar.prepend(`<br><button class="who-am-i-viewing">@${username}</button>`)
                    $(".home-button").css("background-color", "rgba(7, 31, 53, 0.699)").css("border", "1px solid rgba(255, 255, 255, 0.116)")
                    $(".following-button").css("background-color", "rgba(7, 31, 53, 0.699)").css("border", "1px solid rgba(255, 255, 255, 0.116)")
                  
                },
                error: function (error) {
                    console.error('Error fetching wits by user:', error);
                }
            });
        });

        // ==================================
        // LOAD MORE BUTTON
        // ==================================

        // Handle "Load More Wits" button click
        $(document).off('click', '.load-more-btn').on('click', '.load-more-btn', function () {
            const username = $(this).data('username');  // Get the username
            const offset = $(this).data('offset');      // Get the current offset
            const limit = 5;                            // Number of wits to load per batch

            // Make an AJAX call to fetch the next batch of wits
            $.ajax({
                method: 'GET',
                url: `/api/users/${username}/wits?limit=${limit}&offset=${offset}`,
                success: function (wits) {
                    
                    // Loop through the fetched wits and render each wit
                    wits.forEach(witData => {
                        renderWitRow(witData, { username });  // Reuse your existing renderWitRow function
                    });

                    // Update the offset for the next batch of wits
                    const newOffset = offset + limit;
                    $('.load-more-btn').data('offset', newOffset);

                    $('#wits-area').append($('.load-more-btn'));
                    
                    // If less than the limit number of wits were returned, remove the "Load More" button
                    if (wits.length < limit) {
                        $('.load-more-btn').remove();
                    }
                    
                },
                error: function (error) {
                    console.error('Error fetching wits by user:', error);
                }
            });
        });

    };

    // =============================================
    // FUNCTION TO LOAD ALL WITS WITH "Load More" BUTTON
    // =============================================


    async function loadWits(url) {

        if (loading || allWitsLoaded) return;
        loading = true;

        try {
            // Add limit and offset to the URL
            const data = await $.get(`${url}?limit=${limit}&offset=${offset}`);

            if (data.length > 0) {
                offset += data.length;  // Update offset for the next batch of wits
                for (const wit of data) {
                    await renderWitRow(wit, user);  // Render each wit
                }

                // If the number of loaded wits equals the limit, show "Load More" button
                if (data.length === limit) {
                    if (!$('.load-more-wits').length) {
                        $('#wits-area').append(`<button class="load-more-wits">Load More Wits</button>`);
                    }
                } else {
                    // If fewer than the limit, no more wits to load, remove "Load More" button
                    $('.load-more-wits').remove();
                    allWitsLoaded = true;
                }
            } else {
                allWitsLoaded = true;  // No more wits to load
                $('.load-more-wits').remove();  // Remove button if present
            }
            
        } catch (error) {
            console.error("Error loading wits:", error);
        } finally {
            $('#wits-area').append($('.load-more-wits'));
            loading = false;  // Allow further loading
        }
    }

    // CALL TO LOAD WITS INITIALLY
    loadWits('/api/all_wits');

    // Handle "Load More Wits" button click
    $(document).on('click', '.load-more-wits', function () {
        // console.log('test')
        loadWits('/api/all_wits');  // Call loadWits again to load the next batch of wits

    });



    // =============================================
    // CALL TO LOAD WITS USING OTHER API
    // =============================================
    $(".following-button").on('click', async function () {
        $(".wit-row").remove();  // Clear current wits
        await loadWits('/api/all_following_wits');

        $(".following-button").css("background-color", "rgb(34, 67, 97)").css("border", "3px solid white");
        $(".home-button").css("background-color", "rgba(7, 31, 53, 0.699)").css("border", "rgba(255, 255, 255, 0.116)");
    });

    // ========================================
    // LOADING TRENDING WITS
    // ========================================

    function loadTrendingWits() {
        $.get("/api/top_wits").then(function (data) {
            if (data.length !== 0) {
                const profilePicturePromises = data.map(wit =>
                    findProfilePicture(wit.author)
                );
    
                Promise.all(profilePicturePromises).then(profilePictures => {
                    data.forEach((witData, i) => {
                        let likesArray = [];
                        try {
                            likesArray = JSON.parse(witData.likes || '[]');
                        } catch (error) {
                            console.error("Error parsing likes:", error);
                        }
    
                        const likesCount = likesArray.length;
                        const row = $(`
                            <div class="T-wit-row col-md-12" id="wit-${witData.id}">
                                <div class="row">
                                    <div class="col-md-3" id="T-witProfilePic"></div>
                                    <div class="col-md-9">
                                    <h4 class="wit-author" data-username="${witData.author}">@<span class='clickable'>${witData.author}</span></h4>
                                    <a class="following-status">Loading...</a>

                                    <div class="popup profile-popup" style="display: none;">
                                        <div class="followers-list">
                                            <p class="followerAmount" id="follower-count-${witData.id}"></p>
                                            <button class="follow-btn follow-btn-${witData.author}">Follow</button>
                                        </div>
                                    </div>                                        
                                        <p class="T-wit-date">${moment(witData.createdAt).format("h:mma on MMMM Do, YYYY")}</p>
                                        <p class="T-wit-body">${witData.body}</p>
                                        <p class="imgAttachmentDiv"></p>
                                        <button type="button" data-wit-id="${witData.id}" 
                                            class="T-wit-like-btn btn btn-default btn-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor"
                                                 class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                                                <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 
                                                    1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 
                                                    1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 
                                                    1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 
                                                    .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 
                                                    1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 
                                                    .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 
                                                    16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609
                                                    -2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 
                                                    1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 
                                                    1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                                            </svg>
                                            ${likesCount}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `);
    
                        $("#trendingWits").prepend(row);
    
                        const profilePic = profilePictures[i];
                        const profilePicHtml = profilePic
                            ? `<img class="T-Wit-profilePic" src="${profilePic}" />`
                            : `<img class="T-Wit-profilePic" src="/img/defaultProfilePic.png" />`;
                        row.find('#T-witProfilePic').html(profilePicHtml);
    
                        // Handle like button click
                        row.find('.T-wit-like-btn').on('click', function () {
                            const button = $(this);
                            const witId = this.dataset.witId;
    
                            likePost(witId, user.username, row).then(response => {
                                // Toggle the button color based on like status
                                if (response.userAlreadyLiked) {
                                    button.css('background-color', 'red').css('color', 'white');
                                } else {
                                    button.css('background-color', '').css('color', '');
                                }
                            });
                        });
    
                        if (likesArray.includes(user.username.toLowerCase())) {
                            row.find('.T-wit-like-btn').css('background-color', 'red').css('color', 'white');
                        }
    
                        // Load attached image if available
                        if (witData.image) {
                            row.find(".imgAttachmentDiv").html(
                                `<img src="${witData.image}" alt="Wit Image" class="wit-image">`
                            );
                        }
                    });
                });
            }
        });
    }
    
    loadTrendingWits();
    

    // ==================================================

        // SEPARATE FUNCTION FOR LOADING PROFILE PICS SO THEY ARE NOT SKIPPED
        async function handleProfilePicture(wit, row) {
            try {
                const profilePic = await findProfilePicture(wit.author);  // Wait for the profile picture to be fetched
                // console.log("Profile picture fetched:", profilePic);  // Debugging log to check if the profile picture is correct
                
                if (profilePic) {
                    // Update the correct row's profile picture using the dynamic id
                    row.find(`#witProfilePic-${wit.id}`).html(`<img class="Wit-profilePic" src="${profilePic}" alt="Profile Picture">`);
                } else {
                    row.find(`#witProfilePic-${wit.id}`).html(`<img class="Wit-profilePic" src="/img/defaultProfilePic.png" alt="Default Profile Picture">`);
                }
            } catch (error) {
                console.error("Error fetching profile picture:", error);
                row.find(`#witProfilePic-${wit.id}`).html(`<img class="Wit-profilePic" src="/img/defaultProfilePic.png" alt="Default Profile Picture">`);
            }
        }
        
    // ==================================================
    // WHEN THE "WIT" BUTTON IS PRESSED
    // ==================================================

    newWitForm.on("submit", function(event) {
        event.preventDefault();  // Prevent the form from submitting the traditional way
    
        // Check if the body and image inputs are empty
        if (bodyInput.val().trim() === "" && imageInput[0].files[0] == null) {
            alert("Please enter something into the text box or choose an image.");
            return;
        } 
    
        // Create FormData to handle the text and image
        var formData = new FormData();
        formData.append("author", authorInput);
        formData.append("body", bodyInput.val().trim());
    
        if (imageInput[0].files.length > 0) {
            formData.append("image", imageInput[0].files[0]);  // Append image if available
        }
    
        // Submit the form data via AJAX
        createWitFunction(formData);
    
        // Clear input fields after submission
        bodyInput.val("");
        imageInput.val(""); // Clear the image input
        imageInputPreview.attr("src", "").hide();  // Clear the image preview
    
        return false;
    });
    

    function createWitFunction(formData) {
        $.ajax({
            url: "/api/witter",  // Server endpoint to post a new wit
            type: "POST",
            data: formData,
            processData: false,  // Tell jQuery not to process the data
            contentType: false,  // Tell jQuery not to set content-type
            success: function (response) {    
                // appendNewWitToDOM(response);  // Append the newly created wit to the DOM
                window.location.reload() // Reloads page if successful post
            },
            error: function (err) {
                console.log("Error posting new wit:", err.responseJSON);
            }
        });
    }

// ===========================================
// ===========================================

// ===========================================
// FIND PROFILE PICTURE FUNCTION 1
// ===========================================

async function handleProfilePicture(wit, row) {
    try {
        const profilePic = await findProfilePicture(wit.author);  // Wait for the profile picture to be fetched
        // console.log("Profile picture fetched:", profilePic);  // Debugging log to check if the profile picture is correct
        
        if (profilePic) {
            row.find(`#witProfilePic-${wit.id}`).html(`<img class="Wit-profilePic" src="${profilePic}" alt="Profile Picture">`);
        } else {
            row.find(`#witProfilePic-${wit.id}`).html(`<img class="Wit-profilePic" src="/img/defaultProfilePic.png" alt="Default Profile Picture">`);
        }
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        row.find(`#witProfilePic-${wit.id}`).html(`<img class="Wit-profilePic" src="/img/defaultProfilePic.png" alt="Default Profile Picture">`);
    };
};

// ===========================================
// ===========================================

// ===========================================
// FIND PROFILE PICTURE FUNCTION 2
// ===========================================

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
};

// ===========================================
// ===========================================


// ======================================================
// FOLLOW USER BUTTON
// ======================================================

function followPost(targetUsername, followerUsername) {
    $.ajax({
        method: 'POST',
        url: `/api/users/${targetUsername}/follow`,
        data: { username: followerUsername },  // The logged-in user who is following
        success: function (response) {
            const followBtn = $(`[data-username="${targetUsername}"]`).siblings('.popup').find('.follow-btn');

            // Update the follow button and follower count
            followBtn.text(response.isFollowing ? 'Unfollow' : 'Follow');
            followBtn.closest('.followers-list').find('p').text(`Followers: ${response.followersCount}`);

            console.log(response.message);
        },
        error: function (error) {
            console.error("Error following/unfollowing user:", error);
        }
    });
}

// ===========================================
// ===========================================

// ===========================================
// LIKE POST FUNCTION
// ===========================================

function likePost(witId, username, row) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: `/api/wits/${witId}/like`,
            data: { username: username },
            success: function (response) {
                const likeButton = row.find(`.wit-like-btn[data-wit-id="${witId}"]`);
                const TlikeButton = row.find(`.T-wit-like-btn[data-wit-id="${witId}"]`);

                const likeCount = response.numLikes;
                
                // Update the like button text with the new like count
                likeButton.html(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor"
                         class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                        <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 
                            1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 
                            1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 
                            1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 
                            .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 
                            1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 
                            .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 
                            16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609
                            -2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 
                            1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 
                            1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                    </svg>
                    ${likeCount}
                `);

                TlikeButton.html(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor"
                         class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                        <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 
                            1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 
                            1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 
                            1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 
                            .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 
                            1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 
                            .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 
                            16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609
                            -2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 
                            1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 
                            1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                    </svg>
                    ${likeCount}
                `);
                
                // Toggle the like button style based on whether the user liked the wit
                if (response.userAlreadyLiked) {
                    likeButton.css('background-color', 'red').css('color', 'white');
                } else {
                    likeButton.css('background-color', '').css('color', '');
                }

                // Resolve the promise with the response
                resolve(response);
            },
            error: function (error) {
                console.error('Error within likePost function:', error);
                reject(error);
            }
        });
    });
}

// ===========================================

// ===========================================
// RENDER DROPDOWN MENU FUNCTION
// ===========================================
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
            // console.log("Rendering dropdown for wit created by the current user");
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
// ===========================================
// ===========================================

// ===========================================
// DELETE BUTTON FUNCTIONALITY
// ===========================================
function handleDeleteButtonClick(witData, username) {
    // Use a confirm dialog for user confirmation
    var userConfirmation = confirm("Are you sure you want to delete this Wit?");

    // Check if the user clicked "OK" (result is true) or "Cancel" (result is false)
    if (userConfirmation) {
        // User clicked "OK," proceed with the delete action
        console.log("User confirmed deletion");
        
        $(`#wit-${witData}`).remove();
        alert("Wit has been deleted successfully");
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

// ===========================================
// ===========================================

// ===========================================
// EDIT BUTTON FUNCTIONALITY
// ===========================================
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
            
            $(`#wit-${witData}`).find(".wit-body").text(editPrompt);
            alert("Wit has been edited successfully");
        }, 
        error: function(error) {
            console.error('Error within handleEditButton function:', error)
        }
    })
}

// ===========================================
// ===========================================

// ===========================================
// WEATHER API FUNCTION
// ===========================================

jQuery(function() {
    // Check if Geolocation is supported
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        console.log("Geolocation not supported")
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
});

// ===========================================
// ===========================================

// ===========================================
// PROFILE POPUP LOAD FUNCTION
// ===========================================
$(document).on('click', '.wit-author', function () {
    $(this).siblings('.popup').fadeIn();  // Show the popup

    let username = $(this).text().replace('@', '').trim();  // Get the username without '@' and trim extra spaces
    let witId = $(this).closest('.wit-row').attr('id').split('-')[1];  // Get the wit ID

    $.ajax({
        method: 'GET',
        url: `/api/users/${username}/followers`,  // API endpoint
        success: function (response) {
            console.log(`Follower count for ${username}: ${response.followerCount}`);
            console.log(response);

            // Insert profile picture and follower count
            const profilePicUrl = response.ProfilePic ? response.ProfilePic : "./img/defaultProfilePic.png";


            $(`#follower-count-${witId}`).html(`
                <span class="followers-span">
                    <img src="${profilePicUrl}" 
                         alt="Profile Picture" 
                         class="profile-pic" />
                    <p>Followers: ${response.followerCount}</p>
                </span>
            `);

            console.log(response.ProfilePic ? 'Has profile pic' : 'NO PROFILE PIC FOUND');

            // Handle the follow/unfollow button
            console.log(loggedInUser)
            console.log(username)
            const followBtnText = response.followers.includes(loggedInUser) ? 'Unfollow' : 'Follow';
            $(`.follow-btn-${username}`).text(followBtnText);
        },
        error: function (error) {
            console.error(`Error fetching follower count for ${username}:`, error);
        }
    });
});

// Hide the popup on mouse leave or scroll
$(document).on('mouseleave', '.followers-list', function () {
    $('.popup').fadeOut();
});

$(document).on('scroll', function () {
    $('.popup').fadeOut();
});


// POST COMMENT FUNCTION
async function postComment(witId, commentText, username) {
    console.log("postcommentfunction")
    try {
        const response = await $.ajax({
            method: 'POST',
            url: '/api/comments',
            data: { witId, author: username, body: commentText }
        });

        // Once the comment is posted, append it to the comments list
        const commentHtml = `<p class="comment"><strong>${response.author}:</strong> ${response.body}</p>`;
        $(`#comment-section-${witId} .comments-list`).append(commentHtml);
    } catch (error) {
        console.error('Error posting comment:', error);
    }
}

// =======================================
// CHARACTER LIMITS
// =======================================
// Handle character limit for the comment input
$(document).on('input', '.comment-input', function () {
    const witId = $(this).closest('.comment-section').attr('id').split('-')[2];
    const maxChars = 120;  // Character Limit
    const currentLength = $(this).val().length;
    const remainingChars = maxChars - currentLength;

    // Update the character counter
    $(`#char-counter-${witId}`).text(`${remainingChars} characters remaining`);

    // If the limit is reached, prevent further input (optional)
    if (currentLength >= maxChars) {
        $(this).val($(this).val().substr(0, maxChars));  // This prevents extra characters from being added
    }
});

// Handle character limit for the wit-input
$(document).on('input', '#wit-input', function () {
    const maxChars = 220;  
    const currentLength = $(this).val().length;
    const remainingChars = maxChars - currentLength;

    // Update the character counter
    $('#wit-char-counter').text(`${remainingChars} characters remaining`);

    // Optional: If limit is reached, prevent further input
    if (currentLength >= maxChars) {
        $(this).val($(this).val().substr(0, maxChars));  // Prevents input beyond limit
    }
});

// =======================================