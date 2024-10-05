// DEPENDENCIES
require("dotenv").config();

var express = require("express");
var compression = require('compression');
var session = require("express-session");
var passport = require("./config/passport");
var path = require("path"); // Import the 'path' module
var db = require("./models"); // Your existing db model (with Sequelize setup)
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

// Sequelize Configuration (Handle PostgreSQL)
var sequelize;
if (process.env.NODE_ENV === 'production') {
    // Use Heroku database settings for production
    sequelize = new db.Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres', // Use PostgreSQL dialect
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Adjust based on your needs
            }
        }
    });
} else {
    // Use local MySQL for development
    sequelize = new db.Sequelize(process.env.LOCAL_DB_NAME, process.env.LOCAL_DB_USER, process.env.DB_PW, {
        host: process.env.LOCAL_DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        port: process.env.LOCAL_DB_PORT || 3306
    });
}



// Starts the server to begin Listening:
db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
// =====================================
