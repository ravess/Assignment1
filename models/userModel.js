const dbConnect = require('../config/databaseConfig');

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
  getAllUsers: async function (callback) {
    const pool = dbConnect.getConnection();
    pool.getConnection((error, connection) => {
      if (error) {
        callback(error, null);
        return;
      }
      const query = 'SELECT * FROM accounts';

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
};

module.exports = UserModel;
