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
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",  // Change to postgres since you are connecting to a PostgreSQL database
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
