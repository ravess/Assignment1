const dbConn = require("../config/databaseConfig");
const pool = dbConn.createConnPool();

const AuthModel = {
  loginUser: async (username) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        "SELECT username, userpassword, userisActive FROM user where username=?";
      const [results] = await connection.query(query, [username]);
      return results;
    } finally {
      connection.release();
    }
  },
  getUser: async (username) => {
    const connection = await pool.promise().getConnection();
    try {
      console.log(username, `in auth model`);
      const query = "SELECT userid FROM user where username=?";
      const [results] = await connection.query(query, [username]);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = AuthModel;
