// const config = require('../config/config');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

const dbConnect = require("../config/databaseConfig");

const UserModel = {
  // Need to amend the code based here.
  getAllUsers: function () {
    console.log(`gotten into getconnection method`, dbConnect.getConnection());
    dbConnect.getConnection((error, connection) => {
      if (error) {
        throw error;
      }
      const query = "SELECT * FROM accounts";
      console.log(query);
      connection.query(query, (error, results) => {
        connection.release(); // Release the connection back to the pool
        if (error) {
          throw error;
        }
        return results; // Assuming all users is expected
      });
    });
  },
};

module.exports = UserModel;
