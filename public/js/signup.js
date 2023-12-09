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
            passwordInputBox.style.backgroundColor = "#a20000";
            passwordInputBox.style.color = "white";    

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
    });

    function signUpFunction(email, username, password) {
        // Check if the username exists in the database
        $.ajax({
            url: "/api/check_email",
            method: "POST",
            data: { email: email },
            success: function (response) {

                if (response.exists) {

                    console.log("Email exists already")
                    emailInputBox.style.backgroundColor = "#a20000";
                    emailInputBox.style.color = "white";    
                    alert("An account with that email address already exists, please try another Email.")
                    return;

                } else {

                    console.log("Email does not exist");

                    $.ajax({
                        url: "/api/check_username",
                        method: "POST",
                        data: { username: username },
                        success: function (response) {
                            if (response.exists) {

                                usernameInputBox.style.backgroundColor = "#a20000";
                                usernameInputBox.style.color = "white";                
                                alert("Username is already registered to an account, please log in or choose another.")
                                console.log("Username already exists, please choose another");
                                return;

                            } else {

                                console.log("Username does not exist.");

                            }
                        }
                    });

                    // Email does not exist, show an alert or handle it accordingly
                    // Now, proceed with the signup request
                    $.post("/api/signup", {
                        email: email,
                        username: username,
                        password: password
                    })
                        .then(function () {
                            window.location.replace("/login");
                        })
                        .catch(function (err) {
                            console.log("Error during signup:", err);
                        });
                }
            },
            error: function (err) {
                // Handle any error that occurred during the request
                console.error("Error checking if email or username exists:", err);
            }
        })
    }
});