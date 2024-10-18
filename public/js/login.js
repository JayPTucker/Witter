$(document).ready(function () {
    var loginForm = $("form.login");
    var usernameOrEmailInput = $("input#username-input");
    var passwordInput = $("input#password-input");

    var usernameInputBox = document.getElementById("username-input");
    var passwordInputBox = document.getElementById("password-input");

    var alertDiv = document.getElementById("login-failed-alert");

    document.getElementById("resetButton").addEventListener("click", function (event) {
        event.preventDefault();
        resetPassword();
    });

    loginForm.on("submit", function (event) {
        event.preventDefault();

        $(alertDiv).html(""); // Clear previous alerts

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
                $(alertDiv).append(`
                    <div class="alert alert-danger" role="alert">
                      Please type in a valid Username.
                    </div>
                `);
            }

            if (!userData.password) {
                passwordInputBox.style.backgroundColor = "#a20000";
                passwordInputBox.style.color = "white";
                $(alertDiv).append(`
                    <div class="alert alert-danger" role="alert">
                      Please type in a password.
                    </div>
                `);
            }

            // Handle the case where either username or password is missing
            return;
        }

        loginUser(userData.username, userData.password);
        passwordInput.val("");
    });

    function loginUser(username, password) {
        // Perform the login process via AJAX
        $.ajax({
            url: "/api/login",
            method: "POST",
            data: {
                username: username,
                password: password
            },
            success: function (response) {
                // Redirect to /witter after successful login
                window.location.replace("/witter");
            },
            error: function (err) {
                console.log("Error during login:", err);
                // Handle incorrect password or username
                $(alertDiv).html(`
                    <div class="alert alert-danger" role="alert">
                      Invalid username or password, please try again.
                    </div>
                `);
                passwordInputBox.style.backgroundColor = "#a20000";
                passwordInputBox.style.color = "white";
            }
        });
    }
});

// Password reset function remains unchanged
function getEmailParameter() {
    return prompt("Please type in your email address for your account");
}

function verifyCode() {
    return prompt("Please enter the verification code sent to your email address you provided.");
}

function getNewPasswordParameter() {
    return prompt("Please enter a new password");
}

async function resetPassword() {
    const email = getEmailParameter();

    try {
        // Check if the user exists
        const response = await fetch("/api/check_user_existence", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            }),
        });

        const data = await response.json();

        if (!data.exists) {
            alert("Account doesn't exist. Please try another.");
            return;
        }

        // User exists, proceed with the password reset request
        const resetResponse = await fetch("/api/resetPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            }),
        });

        const resetData = await resetResponse.json();

        if (resetData.success) {
            console.log("Password reset email sent successfully");

            // Get verification code and new password
            const verificationCode = verifyCode();

            // Verify the code
            const verifyCodeResponse = await fetch("/api/passwordResetVerifyCode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    verificationCode: verificationCode,
                }),
            });

            const verifyCodeData = await verifyCodeResponse.json();

            if (verifyCodeData.success) {
                console.log("Verification Code approved, proceed with password reset");

                // Get the new password
                const newPassword = getNewPasswordParameter();

                // Proceed with updating the password
                const newPasswordResponse = await fetch("/api/newPasswordResponse", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        verificationCode: verificationCode,
                        newPassword: newPassword,
                    }),
                });

                const passwordResetAlert = await newPasswordResponse.json();

                if (passwordResetAlert.success) {
                    console.log("Password Reset Successful!");
                } else {
                    console.log("Password change unsuccessful");
                }
            } else {
                console.log("Verification Code not approved");
            }
        } else {
            console.log("Password reset email failed to send");
        }
    } catch (error) {
        console.error("Error during password reset:", error);
        alert("Error resetting password");
    }
}
