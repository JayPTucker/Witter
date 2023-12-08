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
        $.post("/api/signup", {
            email: email,
            username: username,
            password: password
        })
            .then(function() {
                window.location.replace("/login");
            })
        .catch(handleLoginErr);
    };

    function handleLoginErr(err) {
        console.log(err.responseJSON)
        console.log(500)
    };
});