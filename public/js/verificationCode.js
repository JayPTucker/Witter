checkUserExistence();

var alertDiv = document.getElementById("signup-failed-alert")

function startVerificationTimer() {
    // Set the initial time
    let seconds = 120;

    // Update the timer every second
    const timerInterval = setInterval(function() {
        seconds--;
        $('#timer').text(seconds + " seconds remaining to verify your account using the verification code.");

        // Check if the timer has reached zero
        if (seconds === 0) {
            clearInterval(timerInterval); // Stop the timer

            fetch("/api/verificationTimeout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: getEmailParameter()
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("Successfully deleted account")
                    window.location.replace("/signup");
                }
            })
        }
    }, 1000);
}

function checkUserExistence() {
    const email = getEmailParameter();

    // Perform an AJAX request to the server to check if the user exists
    fetch("/api/check_user_existence", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.exists) {
            alert("Account doesn't exist. Redirecting to signup page.");
            window.location.replace("/signup");
        } else {
            // User exists, continue with your verification process
            // For example, you can start the timer or any other logic here
            startVerificationTimer();
        }
    })
    .catch(error => {
        console.error("Error checking user existence:", error);
        alert("Error checking user existence. Please try again.");
    });
}

document.getElementById("verificationForm").addEventListener("submit", function(event) {
    event.preventDefault();
    sendVerificationCode();
});

function sendVerificationCode() {
    const verificationCode = document.getElementById("verificationCode").value;

    // Perform an AJAX request to the server to verify the code
    // You can use fetch or another AJAX library for this

    fetch("/api/verify_email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: getEmailParameter(),
            verificationCode: verificationCode,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Email verified successfully. You can now log in.");
            window.location.replace("/login");
        } else {
            $(alertDiv).append(`
                <div class="alert alert-danger" role="alert">
                  Verification code is incorrect, please try again.
                </div>
            `);
        }
    })
    .catch(error => {
        console.error("Error verifying email:", error);
        alert("Error verifying email. Please try again.");
    });
}

function getEmailParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email');
}

document.getElementById("resendButton").addEventListener("click", function(event) {
    event.preventDefault();
    resendCode();
});

function resendCode() {
    const email = getEmailParameter();

    // Perform an AJAX request to the server to resend the verification code
    fetch("/api/resendCode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Verification code resent successfully.");
        } else {
            alert("Error resending verification code. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error resending verification code:", error);
        alert("Error resending verification code. Please try again.");
    });
}