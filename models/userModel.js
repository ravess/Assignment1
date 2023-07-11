const dbConn = require('../config/databaseConfig');
const bcrypt = require('bcryptjs');

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
  createUser: async (username, userpassword, useremail, usergroup) => {
    const pool = dbConn.createConnPool();
    const connection = await pool.promise().getConnection();
    // To do hashing here before sending it into the database/repo.
    try {
      const hashedpassword = await bcrypt.hash(userpassword, 15);
      const query =
        'insert into accounts(username,userpassword,useremail,usergroup,userisActive) values(?,?,?,?,?)';
      const [results] = await connection.query(query, [
        username,
        hashedpassword,
        useremail,
        usergroup,
        1,
      ]);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = UserModel;
