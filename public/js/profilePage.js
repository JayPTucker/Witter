jQuery(function() {
    $.get("/api/user_data").then(function(data) {
        var imageInput = $("#image-input");
        var username = data.username;
        var newProfilePicForm = $("form.new-profilePic");
        var profilePageInfo = $(".user-info");
        
        // Display current profile picture and username
        var row = $(`<div id="profilePicRow" class="profilePicRow"></div>`);
        row.append(`<p>Username: @${username}</p>`);
        var profilePicElement = $(`<p>Profile Picture:</p><img class="profilePic" src="/uploads/${data.profilePicture}">`);
        row.append(profilePicElement);
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
                        // New profile picture URL from the response or update directly from the input
                        var newProfilePicUrl = `/uploads/${imageInput[0].files[0].name}`;

                        // Update the profile picture on the page
                        profilePicElement.find("img").attr("src", newProfilePicUrl + `?t=${new Date().getTime()}`);
                    },
                    error: function (err) {
                        alert("Profile Picture not properly changed.");
                        console.log(err.responseJSON);
                        console.log(500);
                    }
                });
            }

            window.location.reload();
        });
    });
});
