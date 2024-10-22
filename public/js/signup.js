$(document).ready(function () {
    var signUpForm = $("form.signup");
    var emailInput = $("input#email-input");
    var usernameInput = $("input#username-input");
    var passwordInput = $("input#password-input");

    var emailInputBox = document.getElementById("email-input");
    var usernameInputBox = document.getElementById("username-input");
    var passwordInputBox = document.getElementById("password-input");

    var alertDiv = document.getElementById("signup-failed-alert");
    var submitBtn = $(".signup-button")

    // Handle form submission
    signUpForm.on("submit", function (event) {
        event.preventDefault();
        
        $(alertDiv).html(""); // Clear previous alerts        

        var userData = {
            email: emailInput.val().trim(),
            username: usernameInput.val().trim(),
            password: passwordInput.val().trim(),
        };

        resetInputStyles();

        // Check for missing inputs
        if (!userData.email || !userData.username || !userData.password) {
            handleMissingInput(userData);
            return;
        };

        // Check password length
        if (userData.password.length < 8) {
            setInvalidInputStyle(passwordInputBox);
            showAlert("Password must be at least 8 characters long.");
            return;
        };

        if (userData.username.includes(' ')) {
            showAlert("Username cannot have a space in it")
            return;
        };

        // Proceed with signup validation
        signUpFunction(userData.email, userData.username, userData.password);
    });

    // Perform email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Centralized function to handle the signup process
    function signUpFunction(email, username, password) {
        if (!validateEmail(email)) {
            setInvalidInputStyle(emailInputBox);
            showAlert("Please enter a valid email address.");
            return;
        }

        checkIfEmailExists(email, function (emailExists) {
            if (emailExists) {
                setInvalidInputStyle(emailInputBox);
                showAlert("An account with that email already exists.");
            } else {
                checkIfUsernameExists(username, function (usernameExists) {
                    if (usernameExists) {
                        setInvalidInputStyle(usernameInputBox);
                        showAlert("Username is already taken. Please choose another.");
                    } else {
                        signUpRequest(email, username, password);
                    }
                });
            }
        });
    }

    // Helper function to check if the email exists
    function checkIfEmailExists(email, callback) {
        $.ajax({
            url: "/api/check_email",
            method: "POST",
            data: { email: email },
            success: function (response) {
                callback(response.exists);
            },
            error: function (err) {
                console.error("Error checking email:", err);
            },
        });
    }

    // Helper function to check if the username exists
    function checkIfUsernameExists(username, callback) {
        $.ajax({
            url: "/api/check_username",
            method: "POST",
            data: { username: username },
            success: function (response) {
                callback(response.exists);
            },
            error: function (err) {
                console.error("Error checking username:", err);
            },
        });
    }

    // Perform the actual signup request
    function signUpRequest(email, username, password) {
        submitBtn.text("Loading...") 
        submitBtn.css("color", "red")
        $.post("/api/signup", { email, username, password })
            .then(function (data) {
                if (data.success) {
                    window.location.replace(data.redirect);
                } else {
                    console.log("Error during signup:", data);
                    showAlert("Error during signup. Please try again.");
                }
            })
            .catch(function (err) {
                console.error("Error during signup:", err);
                showAlert("An error occurred. Please try again later.");
            });
    }

    // Display an alert message in the alertDiv
    function showAlert(message) {
        $(alertDiv).append(`
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        `);
    }

    // Set invalid input styles
    function setInvalidInputStyle(inputBox) {
        inputBox.style.backgroundColor = "#a20000";
        inputBox.style.color = "white";
    }

    // Reset styles for all input boxes
    function resetInputStyles() {
        [emailInputBox, usernameInputBox, passwordInputBox].forEach((input) => {
            input.style.backgroundColor = "";
            input.style.color = "";
        });
    }

    // Handle missing inputs
    function handleMissingInput(userData) {
        if (!userData.email) {
            setInvalidInputStyle(emailInputBox);
            showAlert("Please enter a valid email address.");
        }
        if (!userData.username) {
            setInvalidInputStyle(usernameInputBox);
            showAlert("Please enter a valid username.");
        }
        if (!userData.password) {
            setInvalidInputStyle(passwordInputBox);
            showAlert("Please enter a valid password.");
        }
    }
});