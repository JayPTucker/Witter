// DEPENDENCIES
require("dotenv").config();

var express = require("express");
var compression = require('compression');
var session = require("express-session");
var passport = require("./config/passport");
var path = require("path"); // Import the 'path' module
var Sequelize = require('sequelize'); // Import Sequelize

// =====================================

// Sets up the Express app
var PORT = process.env.PORT || 8080;

// Set up Sequelize using JAWSDB_URL
var sequelize = new Sequelize(process.env.JAWSDB_URL, {
    dialect: 'mysql', // Use 'mysql' for JawsDB
    dialectOptions: {
        // Additional options if needed
    }
});

var app = express();
// =====================================

app.use(compression());

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// =====================================

// Static directory
app.use(express.static("public"));
// =====================================

app.use(session({ secret: process.env.SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Add the route for the verificationCode page
app.get('/verificationCode', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verificationCode.html'));
});
// =====================================

// Starts the server to begin Listening:
sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
// =====================================
