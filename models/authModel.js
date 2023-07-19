const dbConn = require("../config/databaseConfig");
const pool = dbConn.createConnPool();

const AuthModel = {
  loginUser: async (username) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        "SELECT userid, userpassword, userisActive FROM user where username=?";
      const [results] = await connection.query(query, [username]);
      return results;
    } finally {
      connection.release();
    }
  },
  checkGroup: async (userid, usergroup) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = `SELECT username FROM user WHERE userid=? AND ${usergroup}`;
      const [results] = await connection.query(query, [userid]);
      return results;
    } finally {
      connection.release();
    }
  },
  getUser: async (userid) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = "SELECT userid FROM user where userid=?";
      const [results] = await connection.query(query, [userid]);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = AuthModel;
