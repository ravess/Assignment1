const mysql = require("mysql");

// Single connection
// const dbconnect = {
//   getConnection: function () {
//     const conn = mysql.createConnection({
//       host: process.env.DB_LOCAL_URI,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASS,
//       database: process.env.DB_LOCAL_URI,
//     });
//     return conn;
//   },
// };

// Connection Pool
const dbConnect = mysql.createPool({
  connectionLimit: 10, // Adjust the limit as per your requirements
  host: process.env.DB_LOCAL_URI,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_LOCAL_URI,
});

module.exports = dbConnect;
