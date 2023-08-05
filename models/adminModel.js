const dbConn = require('../config/databaseConfig');
const pool = dbConn.createConnPool();

const AdminModel = {
  getAllUsers: async () => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        'SELECT username, userid, useremail, userisActive, usergroups FROM user';
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  getUser: async (userid) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        'SELECT username,useremail,usergroups,userisActive FROM user where userid=?';
      const [results] = await connection.query(query, [userid]);
      return results;
    } finally {
      connection.release();
    }
  },
  updateUser: async (clauses, values) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = 'UPDATE user SET ' + clauses + ' WHERE userid=?';
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },
  createUser: async (
    username,
    hashedpassword,
    useremail,
    usergroups,
    userisActive
  ) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = `insert into user(username,userpassword,useremail,usergroups,userisActive) values(?,?,?,?,?)`;
      const [results] = await connection.query(query, [
        username,
        hashedpassword,
        useremail,
        usergroups,
        userisActive,
      ]);
      return results;
    } finally {
      connection.release();
    }
  },
  // getGroups: async () => {
  //   const connection = await pool.promise().getConnection();
  //   try {
  //     const query = 'SELECT * FROM nodelogin.groups';
  //     const [results] = await connection.query(query);
  //     return results;
  //   } finally {
  //     connection.release();
  //   }
  // },
  createGroup: async (usergroups) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = 'insert into `groups`(groupname) values(?)';
      const [results] = await connection.query(query, [usergroups]);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = AdminModel;
