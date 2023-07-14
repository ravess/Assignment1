const dbConn = require("../config/databaseConfig");
const pool = dbConn.createConnPool();

const AuthModel = {
  loginUser: async (username) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = `SELECT userid, userpassword, userisActive FROM user where username=?`;
      const [results] = await connection.query(query, [username]);
      return results;
    } finally {
      connection.release();
    }
  },
  checkGroupUser: async (userid, usergroup) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        // "SELECT username FROM user WHERE userid=? AND FIND_IN_SET(usergroup, ?)";
        `SELECT username FROM user WHERE userid=? AND ${usergroup}`;
      // "SELECT username FROM user WHERE userid=? AND CONCAT(',', usergroup, ',') LIKE CONCAT('%,', ?, ',%')";
      const [results] = await connection.query(query, [userid]);
      return results;
    } finally {
      connection.release();
    }
  },

  //CheckGroupUser comes here

  // handling users roles the ...roles when passed in with ('employer', 'admin') it
  // it collects in an array ['employer', 'admin']

  /*
SELECT col_a
FROM table_a
WHERE col_b = 'userid' AND table_b LIKE '%admin%'
*/
};

module.exports = AuthModel;
