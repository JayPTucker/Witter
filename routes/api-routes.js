// Dependencies
var db = require("../models");
var passport = require("../config/passport.js");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Dummy database
const users = [];

// Middleware to parse JSON
app.use(bodyParser.json());

// Dummy function to generate a random verification code
function generateVerificationCode() {
    return Math.floor(1000 + Math.random() * 9000);
}

module.exports = function(app) {

    // Login route if the login is successful
    app.post("/api/login", function(req, res, next) {
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

        // Send verification email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'jaypaultucker@gmail.com',
                pass: process.env.GMAIL_PW
            }
        });

        const mailOptions = {
            from: 'jaypaultucker@gmail.com',
            to: req.body.email,
            subject: 'Email Verification',
            text: `Your verification code is: ${verificationCode}`
        };

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
                await user.update({ verified: true, verificationCode: null });
                res.json({ success: true, message: "Email verified successfully" });
            } else {
                res.status(401).json({ success: false, error: "Invalid verification code" });
            }
        } catch (error) {
            console.error("Error verifying email:", error);
            res.status(500).json({ error: "Error verifying email" });
        }
    });

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
