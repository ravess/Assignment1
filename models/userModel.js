const dbConn = require('../config/databaseConfig');

const UserModel = {
  getAllUsers: async () => {
    const pool = dbConn.createConnPool();
    const connection = await pool.promise().getConnection();
    try {
      const query = 'SELECT * FROM accounts';
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  loginUser: async (username, password) => {
    const pool = dbConn.createConnPool();
    const connection = await pool.promise().getConnection();
    try {
      const query =
        'SELECT * FROM accounts where username=? and userpassword=?';
      const [results] = await connection.query(query, [username, password]);
      return results;
    } finally {
      connection.release();
    }
  },
  updateUser: async (clauses, values) => {
    const pool = dbConn.createConnPool();
    const connection = await pool.promise().getConnection();
    try {
      const query = `update accounts set ${clauses} where userid=?`;
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },

  // For Roy to work on
  createUser: async () => {
    const pool = dbConn.createConnPool();
    const connection = await pool.promise().getConnection();
    try {
      const query =
        'insert into accounts(username,useremail,user,password) values(?,?,?,?)';
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = UserModel;
