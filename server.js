require('dotenv').config(); // Ensure this is at the top of your server.js file
const express = require("express");
const compression = require('compression');
const session = require("express-session");
const passport = require("./config/passport");
const path = require("path");
const { Sequelize } = require('sequelize');
const config = require('./config/config.js'); // Import the config file

// =====================================

// Sets up the Express app
const PORT = process.env.PORT || 8080;
const app = express();
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

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PW,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

// Routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Add the route for the verificationCode page
app.get('/verificationCode', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verificationCode.html'));
});
// =====================================
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Starts the server to begin Listening:
sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
    });
});
// =====================================
