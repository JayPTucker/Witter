$(document).ready(function () {
    var loginForm = $("form.login");
    var usernameOrEmailInput = $("input#username-input");
    var passwordInput = $("input#password-input");

    var usernameInputBox = document.getElementById("username-input")
    var passwordInputBox = document.getElementById("password-input")

    document.getElementById("resetButton").addEventListener("click", function(event) {
        event.preventDefault();
        resetPassword();
    });

    loginForm.on("submit", function (event) {
        event.preventDefault();        
    
        var userData = {
            username: usernameOrEmailInput.val().trim(),
            password: passwordInput.val().trim(),
        };
    
        // Reset styles before checking again
        usernameInputBox.style.backgroundColor = "";
        usernameInputBox.style.color = "";
        passwordInputBox.style.backgroundColor = "";
        passwordInputBox.style.color = "";
    
        if (!userData.username || !userData.password) {
            console.log("Username or password is missing");
    
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
    
        loginUser(userData.username, userData.password);
        usernameOrEmailInput.val("");
        passwordInput.val("");
    });

    function loginUser(username, password) {
        // Check if the username exists in the database
        $.ajax({
            url: "/api/check_username",
            method: "POST",
            data: { username: username },
            success: function (response) {
                if (response.exists) {
                    // Username exists, proceed with login
                    console.log("Username exists, proceed with login");
    
                    // Now, proceed with the login request
                    $.post("/api/login", {
                        username: username,
                        password: password
                    })
                        .then(function () {
                            window.location.replace("/witter");
                        })
                        .catch(function (err) {
                            console.log("Error during login:", err);
                            alert("Password incorrect, please try again.");
                        });
                } else {
                    // Username does not exist, show an alert or handle it accordingly
                    console.log("Username not found in the database");
                    alert("Username not found");
                }
            },
            error: function (err) {
                // Handle any error that occurred during the request
                console.error("Error checking username:", err);
            }
        });
    }
    
});

function getEmailParameter() {
    return prompt("Please type in your email address for your account")
}

function getNewPasswordParameter() {
    return prompt("Please enter a new password");
}

function resetPassword() {
    const email = getEmailParameter();

    // Perform an AJAX request to the server to check if the user exists
    fetch("/api/check_user_existence", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.exists) {
            alert("Account doesn't exist. Please try another.");
        } else {
            // User exists, continue with your verification process
            console.log("Account Exists, proceed with reset");

            // Proceed with the password reset request
            fetch("/api/resetPassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email
                }),
            })
            .then(response => response.json())
            .then(res => {
                if (res.success === true) {
                    console.log("Password email sent successfully");

                } else {
                    console.log("Password email reset failed to send");
                }
            })
            .catch(error => {
                console.error("Error during password reset:", error);
                alert("Error resetting password");
            });
        }
    })
    .catch(error => {
        console.error("Error checking user existence:", error);
        alert("Error checking user existence. Please try again.");
    });
}