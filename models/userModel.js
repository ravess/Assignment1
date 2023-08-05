const dbConn = require('../config/databaseConfig');
const pool = dbConn.createConnPool();

const UserModel = {
  getProfile: async (username) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        'SELECT usergroups, username, userisActive, useremail FROM user where username=?';
      const [results] = await connection.query(query, [username]);
      return results;
    } finally {
      connection.release();
    }
  },
  updateUser: async (clauses, values) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = `UPDATE user SET ${clauses} WHERE username=?`;
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = UserModel;
