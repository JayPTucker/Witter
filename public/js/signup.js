$(document).ready(function() {

    var signUpForm = $("form.signup");
    var emailInput = $("input#email-input");
    var usernameInput = $("input#username-input");
    var passwordInput = $("input#password-input");

    var emailInputBox = document.getElementById("email-input");
    var usernameInputBox = document.getElementById("username-input");
    var passwordInputBox = document.getElementById("password-input");

    signUpForm.on("submit", function(event) {
        event.preventDefault();
        var userData = {
            email: emailInput.val().trim(),
            username: usernameInput.val().trim(),
            password: passwordInput.val().trim()
        };

        if (userData.password.length < 8) {
            setInvalidInputStyle(passwordInputBox);
            alert("Password must be more than 8 characters long");
            return;
        }

        resetInputStyles();

        if (!userData.email || !userData.username || !userData.password) {
            handleMissingInput(userData);
            return;
        }

        signUpFunction(userData.email, userData.username, userData.password);
    });

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function signUpFunction(email, username, password) {
        if (!validateEmail(email)) {
            setInvalidInputStyle(emailInputBox);
            alert("Please enter a valid email address.");
            return;
        }
    
        $.ajax({
            url: "/api/check_email",
            method: "POST",
            data: { email: email },
            success: function (response) {
                if (response.exists) {
                    setInvalidInputStyle(emailInputBox);
                    alert("An account with that email address already exists, please try another email.");
                } else {
                    $.ajax({
                        url: "/api/check_username",
                        method: "POST",
                        data: { username: username },
                        success: function (response) {
                            if (response.exists) {
                                setInvalidInputStyle(usernameInputBox);
                                alert("Username is already registered to an account, please log in or choose another.");
                            } else {
                                // Proceed with the signup request
                                $.post("/api/signup", {
                                    email: email,
                                    username: username,
                                    password: password
                                })
                                .then(function (data) {
                                    console.log("Server response:", data);
                                    if (data.success) {
                                        window.location.replace(data.redirect);
                                    } else {
                                        console.log("Error during signup:", data);
                                        // Handle the error (e.g., display an error message to the user)
                                    }
                                })
                                .catch(function (err) {
                                    console.log("Error during signup:", err);
                                    // Handle the error (e.g., display an error message to the user)
                                });
                            }
                        }
                    });
                }
            },
            error: function (err) {
                console.error("Error checking if email or username exists:", err);
                // Handle the error (e.g., display an error message to the user)
            }
        });
    }
    
    // Log emailInputBox and usernameInputBox to the console to check their values
    console.log("emailInputBox:", emailInputBox);
    console.log("usernameInputBox:", usernameInputBox);
    

    function setInvalidInputStyle(inputBox) {
        inputBox.style.backgroundColor = "#a20000";
        inputBox.style.color = "white";
    }

    function resetInputStyles() {
        emailInputBox.style.backgroundColor = "";
        emailInputBox.style.color = "";
        usernameInputBox.style.backgroundColor = "";
        usernameInputBox.style.color = "";
        passwordInputBox.style.backgroundColor = "";
        passwordInputBox.style.color = "";
    }

    function handleMissingInput(userData) {
        if (!userData.email) {
            setInvalidInputStyle(emailInputBox);
            alert("Please type in a valid email address.");
        }

        if (!userData.username) {
            setInvalidInputStyle(usernameInputBox);
            alert("Please type in a valid username.");
        }

        if (!userData.password) {
            setInvalidInputStyle(passwordInputBox);
            alert("Please type in a valid password.");
        }
    }
});
