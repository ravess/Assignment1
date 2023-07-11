// Single connection
// const dbConnect = {
//   getConnection: function () {
//     const conn = mysql.createConnection({
//       host: process.env.DB_LOCAL_URI,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASS,
//       database: process.env.DB_NAME,
//     });
//     return conn;
//   },
// };

const mysql = require('mysql2');

// Connection Pool would be advantageous due to optimizing of resources
const dbConnect = {
  createConnPool: function () {
    const conn = mysql.createPool({
      connectionLimit: 10, // Adjust the limit as per your requirements
      host: process.env.DB_LOCAL_URI,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    return conn;
  },
};

module.exports = dbConnect;
