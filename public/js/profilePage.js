jQuery(function() {
    $.get("/api/user_data").then(function(data) {
        var imageInput = $("#image-input");
        var username = data.username;
        var newProfilePicForm = $("form.new-profilePic");
        var profilePageInfo = $(".user-info");
        
        // Display current profile picture and username
        var row = $(`<div id="profilePicRow" class="profilePicRow"></div>`);
        row.append(`<p>Username: @${username}</p>`);

        if (!data.profilePicture) {
            console.log("No Profile Pic Set in the DB, using Default");
            row.append(`<img class="currentProfilePic" src="/img/defaultProfilePic.png"></img>`);
        } else {
            console.log("Profile Pic is Set in the DB");
            var profilePicElement = $(`<p>Profile Picture:</p><img class="currentProfilePic" src="/uploads/${data.profilePicture}">`);
            row.append(profilePicElement);
        }

        $(".user-info").prepend(row);

        newProfilePicForm.on("submit", function(event) {
            event.preventDefault();
        
            if (imageInput[0].files[0] == null) {
                alert("Please choose an image.");
            } else {
                var formData = new FormData();
                formData.append("username", username);
                formData.append("profilePicture", imageInput[0].files[0]);
        
                $.ajax({
                    url: "/api/changeProfilePic",
                    type: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        alert("Profile Picture changed successfully");
        
                        // Update the profile picture on the page without refreshing
                        var newProfilePicUrl = `/uploads/${imageInput[0].files[0].name}`;
        
                        // Update the profile picture on the page
                        profilePicElement.find("img").attr("src", newProfilePicUrl + `?t=${new Date().getTime()}`);
                        
                        // Optionally reload the page if you want to ensure the backend data is also updated
                        window.location.reload(); // Uncomment this line if needed
                    },
                    error: function (err) {
                        alert("Profile Picture not properly changed.");
                        console.log(err.responseJSON);
                        console.log(500);
                    }
                });
            }
        });
        
    });
});
