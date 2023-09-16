// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
var connection = require("../config/connection.js");

// Routes
// =============================================================
module.exports = function(app) {
  // Get all wits
  app.get("/api/all", function(req, res) {
    var dbQuery = "SELECT * FROM wits";

    connection.query(dbQuery, function(err, result) {
      if (err) throw err;
      res.json(result);
    });
  });

  // Add a Wit
  app.post("/api/new", function(req, res) {
    console.log("Wit Data:");
    console.log(req.body);

    var dbQuery = "INSERT INTO wits (author, body, created_at) VALUES (?,?,?)";

    connection.query(dbQuery, [req.body.author, req.body.body, req.body.created_at], function(err, result) {
      if (err) throw err;
      console.log("Wit Successfully Saved!");
      res.end();
    });
  });
};
