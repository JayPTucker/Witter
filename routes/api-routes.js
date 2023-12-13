// Dependencies
var db = require("../models");
var passport = require("../config/passport.js");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');

const bcrypt = require("bcryptjs");

const app = express();
const port = 3000;

// Dummy database
const users = [];

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'wittersocial@gmail.com',
        pass: process.env.GMAIL_PW
    }
});


// Middleware to parse JSON
app.use(bodyParser.json());

// Dummy function to generate a random verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

module.exports = function(app) {

    // Login route if the login is successful
    app.post("/api/login", async function(req, res, next) {

        try {
            const user = await db.User.findOne({
                where: {
                    username: req.body.username,
                    isVerified: true
                }
            });
    
            if (user) {
                // Mark the user as verified
                console.log("User is verified")
            } else {
                console.log("user is not verified")
                return;
            }
        } catch (error) {
            console.error("Error validating if Email is verified:", error);
            res.status(500).json({ error: "Error verifying email" });
        }
        
        passport.authenticate("local", function(err, user, info) {
            if (err) {
                // Handle unexpected errors
                console.error("Error during authentication:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
    
            if (!user) {
                // Handle authentication failure (invalid username or password)
                console.log("Authentication failed");
                return res.status(401).json({ error: "Invalid username or password" });
            }
    
            // Authentication successful, log in the user
            req.logIn(user, function(err) {
                if (err) {
                    // Handle login error
                    console.error("Error during login:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
    
                // Return the user data
                return res.json(req.user);
            });
        })(req, res, next);
    });
    
    app.post("/api/resetPassword", async function(req, res) {
        try {
            // Generate a new verification code
            const verificationCode = generateVerificationCode();
    
            // Update the user's verification code in the database
            const user = await db.User.findOne({ where: { email: req.body.email } });

            if (user) {
                await user.update({ verificationCode: verificationCode.toString() });
            } else {
                return res.status(404).json({ success: false, error: "User not found" });
            }
    
            const mailOptions = {
                from: 'wittersocial@gmail.com',
                to: req.body.email,
                subject: 'Password Reset Verification Code',
                html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
                };
    
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.error("Error sending password reset verification email:", error);
                    res.status(500).json({ success: false, error: "Error sending password reset verification email" });
                } else {
                    console.log("Password reset Verification email sent:", info.response);
                    res.json({ success: true });
                }
            });
        } catch (error) {
            console.error("Error resetting password:", error);
            res.status(500).json({ success: false, error: "Error resetting password", details: error });
        }
    })

    app.post("/api/passwordResetVerifyCode", async function(req, res) {
        try {
            // Update the user's verification code in the database
            const user = await db.User.findOne({ where: { verificationCode: req.body.verificationCode } });

            if (user) {
                return res.json({ success: true });
            } else {
                return res.status(404).json({ success: false, error: "User not found" });
            }
        } catch (error) {
            console.error("Error resetting password on pwresetverifycode:", error);
            res.status(500).json({ success: false, error: "Error resetting password", details: error });
        }
    })

    app.post("/api/newPasswordResponse", async function(req, res) {
        try {
            const { email, verificationCode, newPassword } = req.body;
    
            // Find the user by email and verification code
            const user = await db.User.findOne({
                where: {
                    email: email,
                    verificationCode: verificationCode,
                },
            });
    
            if (!user) {
                return res.status(404).json({ success: false, error: "User not found or verification code is invalid" });
            }
    
            // Update the password and clear the verification code
            await user.update({
                password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10)),
                verificationCode: null,
            })

            const mailOptions = {
                from: 'wittersocial@gmail.com',
                to: req.body.email,
                subject: 'Witter Account Password Reset',
                html: `<p>Your password has been reset.  If this was not you, please report it to our service team by sending us an email back.  Thanks!</p>`        
            };
    
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.error("Error sending password reset confirmation:", error);
                    res.status(500).json({ error: "Error sending password reset confirmation email" });
                } else {
                    console.log(":", info.response);
                }
            })
    
            return res.json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            console.error("Error updating password:", error);
            return res.status(500).json({ success: false, error: "Error updating password", details: error });
        }
    })


    app.post("/api/verify_email", async function(req, res) {
        try {
            const user = await db.User.findOne({
                where: {
                    email: req.body.email,
                    verificationCode: req.body.verificationCode
                }
            });
    
            if (user) {
                // Mark the user as verified
                await user.update({ isVerified: true, verificationCode: null });
                res.json({ success: true, message: "Email verified successfully" });
        
                const mailOptions = {
                    from: 'wittersocial@gmail.com',
                    to: req.body.email,
                    subject: 'Witter Account Verified',
                    html: `<p>Thank you for verifying your account, you may now login!</p>`        
                };
        
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.error("Error sending verification email:", error);
                        res.status(500).json({ error: "Error sending verification email" });
                    } else {
                        console.log(":", info.response);
                        res.json({ success: true, redirect: `/verificationCode?email=${req.body.email}` });
                    }
                })

            } else {
                res.status(401).json({ success: false, error: "Invalid verification code" });
            }
        } catch (error) {
            console.error("Error verifying email:", error);
            res.status(500).json({ error: "Error verifying email" });
        }
    });
    

    app.post("/api/signup", async function(req, res) {
    try {
        // Generate a verification code
        const verificationCode = generateVerificationCode();

        // Create a new user with the verification code
        const newUser = await db.User.create({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            verificationCode: verificationCode // Set the verification code during user creation
        });

        const mailOptions = {
            from: 'wittersocial@gmail.com',
            to: req.body.email,
            subject: 'Witter Email Verification Code',
            html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>
            <p>Please use this link to get back to the verification page: 
            <a href="https://localhost:8080/verificationCode?email=${req.body.email}">Verification Page</a></p>`        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error("Error sending verification email:", error);
                res.status(500).json({ error: "Error sending verification email" });
            } else {
                console.log("Verification email sent:", info.response);
                res.json({ success: true, redirect: `/verificationCode?email=${req.body.email}` });

            }
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(401).json({ error: "Error creating user", details: error });
    }
});

app.post("/api/check_user_existence", async function (req, res) {
    try {
        const user = await db.User.findOne({
            where: {
                email: req.body.email,
            },
        });

        res.json({ exists: !!user }); // Send whether the user exists as JSON
    } catch (error) {
        console.error("Error checking user existence:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/resendCode", async function(req, res) {
    try {
        // Generate a new verification code
        const verificationCode = generateVerificationCode();

        // Update the user's verification code in the database
        const user = await db.User.findOne({ where: { email: req.body.email } });

        if (user) {
            await user.update({ verificationCode: verificationCode });
        } else {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const mailOptions = {
            from: 'wittersocial@gmail.com',
            to: req.body.email,
            subject: 'Witter Email Verification Code',
            html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>
            <p>Please use this link to get back to the verification page: 
            <a href="https://localhost:8080/verificationCode?email=${req.body.email}">Verification Page</a></p>`
            };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error("Error sending verification email:", error);
                res.status(500).json({ success: false, error: "Error sending verification email" });
            } else {
                console.log("Verification email sent:", info.response);
                res.json({ success: true });
            }
        });
    } catch (error) {
        console.error("Error resending the verification email:", error);
        res.status(500).json({ success: false, error: "Error resending verification", details: error });
    }
});

    app.post("/api/verificationTimeout", async function(req, res) {
        try {
            // Update the user's verification code in the database
            const user = await db.User.findOne({ where: { email: req.body.email } });

            if (user) {
                await user.destroy();
                return res.json({ success: true, message: "Account deleted successfully" });
            } else {
                return res.status(404).json({ success: false, error: "User not found" });
            }

        } catch (error) {
            console.error("Error deleting account", error);
            res.status(500).json({ success: false, error: "Error removing account", details: error });
        }
    })

    // Check if a username exists
    app.post("/api/check_username", function(req, res) {
        const usernameToCheck = req.body.username;

        // Query the database to check if the username exists
        db.User.findOne({
            where: {
                username: usernameToCheck
            }
        })
        .then(function(user) {
            res.json({ exists: !!user }); // Send whether the username exists as JSON
        })
        .catch(function(err) {
            console.error("Error checking username:", err);
            res.status(500).json({ error: "Internal Server Error" });
        });
    });

    // Check if an email exists
    app.post("/api/check_email", function(req, res) {
        const emailToCheck = req.body.email;

        // Query the database to check if the email exists
        db.User.findOne({
            where: {
                email: emailToCheck
            }
        })
        .then(function(user) {
            res.json({ exists: !!user }); // Send whether the email exists as JSON
        })
        .catch(function(err) {
            console.error("Error checking email:", err);
            res.status(500).json({ error: "Internal Server Error" });
        });
    });

    // Logout route
    app.get("/logout", function(req, res) {
        // req.logout is used by passport.js - commonly used with express.js
        req.logout(function(err) {
            if (err) {
                // Handle error, e.g., send an error response
                return res.status(500).json({ error: "Logout failed" });
            }
    
            // Successful logout, redirect or send a success response
            res.redirect("/");
        });
    });

    // User data route
    app.get("/api/user_data", function(req, res) {
        if (!req.user) {
            console.log("Not logged in");
            res.json({});
        } else {
            res.json({
                username: req.user.username,
                password: req.user.password
            });
        }
    });

    // All wits route
    app.get("/api/all_wits", function(req, res) {
        db.Wit.findAll({}).then(function(results) {
            res.json(results);
        });
    });

    app.post("/api/witter", upload.single("image"), function (req, res) {
        console.log("Received Data:", req.body);  // Log other form data
        console.log("Received File:", req.file);  // Log the file data
    
        const { author, body } = req.body;
        const image = req.file;
    
        console.log("Author:", author);
        console.log("Body:", body);
        console.log("Image:", image);
    
        db.Wit.create({
            author: author,
            body: body,
            image: image ? image.filename : null // Store the filename in the database if it exists
        })
        .then(function (results) {
            console.log("Wit Created:", results);
            res.json(results); // Send the created wit back as JSON
        })
        .catch(function (err) {
            console.log("Error creating wit:", err);
            res.status(401).json(err);
        });
    });
};
