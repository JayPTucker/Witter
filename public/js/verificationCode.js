document.getElementById("verificationForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const verificationCode = document.getElementById("verificationCode").value;

    // Perform an AJAX request to the server to verify the code
    // You can use fetch or another AJAX library for this

    // For example:
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
            alert("Invalid verification code. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error verifying email:", error);
        alert("Error verifying email. Please try again.");
    });
});

function getEmailParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email');
}