'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(__filename);
var env = process.env.NODE_ENV || 'development';   // Defaults to 'development'
var config = require(__dirname + '/../config/config.js')[env];

var db = {};

console.log("Current Environment:", env);  // This will show if the 'env' is being set correctly
console.log("Loaded Config:", config);     // This will show if the config is being loaded correctly

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}



// Check if use_env_variable is set (e.g., for cloud-hosted DBs like AWS RDS)
if (config.use_env_variable) {
  // Connect using environment variable (usually set in production environments)
  var sequelize = new Sequelize(process.env[config.use_env_variable], {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true, // Enable SSL for cloud databases
        rejectUnauthorized: false // Allow self-signed certificates (adjust this based on your provider)
      }
    }
  });
} else {
  // Connect using standard credentials
  var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: process.env.DB_HOST || config.host, // Use DB_HOST from env or config
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true, // Enable SSL for cloud databases
        rejectUnauthorized: false // Same as above
      }
    }
  });
}

// Dynamically load models
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// If models have associations, setup relationships
Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
