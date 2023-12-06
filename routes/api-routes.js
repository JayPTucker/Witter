// Dependencies
var db = require("../models");
var passport = require("../config/passport.js");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

module.exports = function(app) {
    // Login route
    app.post("/api/login", passport.authenticate("local"), function(req, res) {
        res.json(req.user);
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
        req.logout();
        res.redirect("/");
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
