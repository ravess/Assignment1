const dbConn = require("../config/databaseConfig");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");

// const UserModel = {
//   getAllUsers: function () {
//     return new Promise((resolve, reject) => {
//       const pool = dbConnect.getConnection();
//       pool.getConnection((error, connection) => {
//         if (error) {
//           reject(error);
//           return;
//         }
//         const query = 'SELECT * FROM accounts';

//         connection.query(query, (error, results) => {
//           connection.release(); // Release the connection back to the pool
//           if (error) {
//             reject(error);
//             return;
//           }
//           resolve(results); // Resolve the promise with the results
//         });
//       });
//     });
//   },
// };

const UserModel = {
  getAllUsers: function (callback) {
    const pool = dbConn.createConnPool();
    pool.getConnection((error, connection) => {
      if (error) {
        callback(error, null);
        return;
      }
      const query = "SELECT * FROM accounts";

      connection.query(query, (error, results) => {
        connection.release(); // Release the connection back to the pool
        if (error) {
          callback(error, null);
          return;
        }
        callback(null, results); // Pass the results to the callback
      });
    });
  },
  loginUser: function (username, userpass, callback) {
    const pool = dbConn.createConnPool();
    pool.getConnection((error, connection) => {
      if (error) {
        callback(error, null);
        return;
      }
      const query =
        "SELECT * FROM accounts where username=? and userpassword=?";
      connection.query(query, [username, userpass], (error, results) => {
        connection.release();
        if (error) {
          callback(error, null);
          return;
        }

        //dont put in model layer first.
        // let token;
        // if (results.length == 1) {
        //   token = jwt.sign({ user: results[0].username}, process.env.JWT_SECRET, {expiresIn: '300s'});
        // }

        return callback(null, results);
      });
    });
  },
  updateUser: function (clauses, values, callback) {
    const pool = dbConn.createConnPool();
    pool.getConnection((error, connection) => {
      if (error) {
        callback(error, null);
        return;
      }
      const query = `update accounts set ${clauses} where userid=?`;

      connection.query(query, values, (error, results) => {
        connection.release(); // Release the connection back to the pool
        if (error) {
          callback(error, null);
          return;
        }
        callback(null, results); // Pass the results to the callback
      });
    });
  },
};

module.exports = UserModel;
