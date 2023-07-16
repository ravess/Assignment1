const dbConn = require('../config/databaseConfig');
const pool = dbConn.createConnPool();

const UserModel = {
  getProfile: async (userid) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = 'SELECT usergroup, username FROM user where userid=?';
      const [results] = await connection.query(query, [userid]);
      return results;
    } finally {
      connection.release();
    }
  },
  updateUser: async (clauses, values) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = `UPDATE user SET ${clauses} WHERE userid=?`;
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = UserModel;
