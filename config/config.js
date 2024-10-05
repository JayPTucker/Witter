
module.exports = {
  "development": {
    "username": process.env.DB_USER || "root",
    "password": process.env.DB_PW,
    "database": process.env.DB_NAME || "witterdb",
    "host": process.env.DB_HOST || "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": process.env.DB_PW,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.DB_USER,      // Add username
    "password": process.env.DB_PW,        // Add password
    "database": process.env.DB_NAME,      // Add database name
    "host": process.env.DB_HOST,          // Add RDS host
    "dialect": "mysql"
  }
}
