const dbConn = require("../config/databaseConfig");
const pool = dbConn.createConnPool();

const tmsModel = {
  getAllApps: async () => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "SELECT username, userid, useremail, userisActive, usergroup FROM user";
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  getApp: async () => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "SELECT username, userid, useremail, userisActive, usergroup FROM user";
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  createApp: async (usergroup) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "insert into `groups`(groupname) values(?)";
      const [results] = await connection.query(query, [usergroup]);
      return results;
    } finally {
      connection.release();
    }
  },
  updateApp: async (clauses, values) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "UPDATE user SET " + clauses + " WHERE userid=?";
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },
  getAllPlans: async () => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "SELECT username, userid, useremail, userisActive, usergroup FROM user";
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  getPlan: async (userid) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "SELECT username,useremail,usergroup,userisActive FROM user where userid=?";
      const [results] = await connection.query(query, [userid]);
      return results;
    } finally {
      connection.release();
    }
  },
  createPlan: async (usergroup) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "insert into `groups`(groupname) values(?)";
      const [results] = await connection.query(query, [usergroup]);
      return results;
    } finally {
      connection.release();
    }
  },
  updatePlan: async (clauses, values) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "UPDATE user SET " + clauses + " WHERE userid=?";
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },
  getAllTasks: async () => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "SELECT username, userid, useremail, userisActive, usergroup FROM user";
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  getTask: async (clauses, values) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = "UPDATE user SET " + clauses + " WHERE userid=?";
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },
  createTask: async (usergroup) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = "insert into `groups`(groupname) values(?)";
      const [results] = await connection.query(query, [usergroup]);
      return results;
    } finally {
      connection.release();
    }
  },
  updateTask: async (clauses, values) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        "UPDATE user SET " + clauses + " WHERE userid=?";
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = tmsModel;
