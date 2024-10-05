// DEPENDENCIES
require("dotenv").config();

var express = require("express");
var compression = require('compression');
var session = require("express-session");
var passport = require("./config/passport");
var path = require("path");
var db = require("./models");

// =====================================

// Sets up the Express app
var PORT = process.env.PORT || 8080;
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

app.use(session({ 
    secret: process.env.SECRET, 
    resave: true, 
    saveUninitialized: true 
}));
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

// Sequelize Configuration (Handle CloudCube or local MySQL)
let sequelize;

if (process.env.CLOUDCUBE_URL) {
    // Use CloudCube for production
    sequelize = new db.Sequelize(process.env.CLOUDCUBE_URL, {
        dialect: 'mysql',
        dialectOptions: {
            // Additional options if needed
        }
    });
} else {
    // Use local MySQL for development
    sequelize = new db.Sequelize(process.env.LOCAL_DB_NAME, process.env.LOCAL_DB_USER, process.env.LOCAL_DB_PASSWORD, {
        host: process.env.LOCAL_DB_HOST || 'localhost',
        dialect: 'mysql',
        port: process.env.LOCAL_DB_PORT || 3306, // Default MySQL port
        logging: console.log // Optional: log SQL queries for debugging
    });
}

// Starts the server to begin listening
db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log(`==> 🌎  Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// =====================================
