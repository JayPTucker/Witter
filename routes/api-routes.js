// Dependencies
var db = require("../models");
var passport = require("../config/passport.js");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

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

    // Signup route
    app.post("/api/signup", function(req, res) {
        db.User.create({
            username: req.body.username,
            password: req.body.password
        })
        .then(function() {
            res.redirect("/login");
        })
        .catch(function(err) {
            res.status(401).json(err);
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
