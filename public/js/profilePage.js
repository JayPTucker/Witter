jQuery(function() {
    $.get("/api/user_data").then(function(data) {
        var imageInput = $("#image-input");
        var username = data.username;
        var newProfilePicForm = $("form.new-profilePic");
        var saveBtn = $(".profilepic-button")

        // Display current profile picture and username
        var row = $(`<div id="profilePicRow" class="profilePicRow"></div>`);
        row.append(`<p>Username: @${username}</p>`);

        var profilePicElement;
        if (!data.profilePicture) {
            console.log("No Profile Pic Set in the DB, using Default");
            profilePicElement = $(`<p>Profile Picture:</p><img class="currentProfilePic" src="/img/defaultProfilePic.png"></img>`);
        } else {
            console.log("Profile Pic is Set in the DB");
            profilePicElement = $(`<p>Profile Picture:</p><img class="currentProfilePic" src="${data.profilePicture}">`);
        }

        row.append(profilePicElement);
        $(".user-info").prepend(row);

        // ================================
        // PREVIEW IMAGE ON FILE SELECTION
        // ================================
        imageInput.on("change", function() {
            if (imageInput[0].files && imageInput[0].files[0]) {
                var reader = new FileReader();

                reader.onload = function(e) {
                    // Update the src attribute of the currentProfilePic dynamically after it exists in the DOM
                    row.find("img.currentProfilePic").attr('src', e.target.result);
                    saveBtn.text("SAVE")
                    saveBtn.css("background-color", "red")
                }

                // Read the image file as a data URL
                reader.readAsDataURL(imageInput[0].files[0]);
            }
        });

        newProfilePicForm.on("submit", function(event) {
            event.preventDefault();
            saveBtn.text("Loading...")
        
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
                        var reader = new FileReader();
                        console.log("Profile Picture changed successfully");
                        
                        saveBtn.text("Success")
                        saveBtn.css("background-color", "green")
                    
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
