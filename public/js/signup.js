$(document).ready(function() {

    // Referencing from our signup.html
    var signUpForm = $("form.signup")

    var emailinput = $("input#email-input");
    var usernameInput = $("input#username-input");
    var passwordInput = $("input#password-input");

    var emailInputBox = document.getElementById("email-input")
    var usernameInputBox = document.getElementById("username-input")
    var passwordInputBox = document.getElementById("password-input")

    // When the Submit button is click, we validate the username and password are not blank
    signUpForm.on("submit", function(event) {
        event.preventDefault();
    
        var userData = {
            email: emailinput.val().trim(),
            username: usernameInput.val().trim(),
            password: passwordInput.val().trim()
        };

        if (userData.password.length < 8) {
            console.log("Password too short")
            alert("Password must be more than 8 characters long")
            return;
        }
    
        // Reset styles before checking again
        emailInputBox.style.backgroundColor = "";
        emailInputBox.style.color = "";
        usernameInputBox.style.backgroundColor = "";
        usernameInputBox.style.color = "";
        passwordInputBox.style.backgroundColor = "";
        passwordInputBox.style.color = "";
    
        if (!userData.email || !userData.username || !userData.password) {
            console.log("Username or password is missing");

            if (!userData.email) {
                emailInputBox.style.backgroundColor = "#a20000";
                emailInputBox.style.color = "white";
                alert("Please type in a valid email address.")
            }
    
            if (!userData.username) {
                usernameInputBox.style.backgroundColor = "#a20000";
                usernameInputBox.style.color = "white";
                alert("Please type in a valid username.")
            }
    
            if (!userData.password) {
                passwordInputBox.style.backgroundColor = "#a20000";
                passwordInputBox.style.color = "white";
                alert("Please type in a valid password.")
            }
    
            // Handle the case where either username or password is missing
            return;
        }
    
        signUpFunction(userData.email, userData.username, userData.password);
        emailinput.val("");
        usernameInput.val("");
        passwordInput.val("");
    });

    function signUpFunction(email, username, password) {
    //     $.post("/api/signup", {
    //         email: email,
    //         username: username,
    //         password: password
    //     })
    //         .then(function() {
    //             window.location.replace("/login");
    //         })
    //     .catch(handleLoginErr);
    // };

    // function handleLoginErr(err) {
    //     console.log(err.responseJSON)
    //     console.log(500)
    // };
            // Check if the username exists in the database
        $.ajax({
            url: "/api/check_email",
            method: "POST",
            data: { email: email },
            success: function (response) {
                if (response.exists) {

                    console.log("Email exists already")
                    alert("An account with that email address already exists")

                } else {
                    // Email does not exist, show an alert or handle it accordingly
                    console.log("Email does not exist");

                    // Now, proceed with the login request
                    $.post("/api/signup", {
                        email: email,
                        username: username,
                        password: password
                    })
                        .then(function () {
                            window.location.replace("/login");
                        })
                        .catch(function (err) {
                            console.log("Error during login:", err);
                        });
                }
            },
            error: function (err) {
                // Handle any error that occurred during the request
                console.error("Error checking if email exists:", err);
            }
        })
    }
});