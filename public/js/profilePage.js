jQuery(function() {
    $.get("/api/user_data").then(function(data) {
        var imageInput = $("#image-input");
        var username = data.username;
        var newProfilePicForm = $("form.new-profilePic");

        console.log(username);

        newProfilePicForm.on("submit", function(event) {
            event.preventDefault();

            if (imageInput[0].files[0] == null) {
                alert("Please choose an image.")
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
                        alert("Profile Picture changed successfully")
                    },
                    error: function (err) {
                        alert("Profile Picture not properly changed.")
                        console.log(err.responseJSON);
                        console.log(500);
                    }
                });
            }
        });
    });
});
