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
    "username": process.env.DB_USER,
    "password": process.env.DB_PW,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "dialectOptions": {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
