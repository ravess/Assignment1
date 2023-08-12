const dbConn = require('../config/databaseConfig');
const pool = dbConn.createConnPool();

const a3Model = {
  loginUser: async (username) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        'SELECT username, userpassword, userisActive FROM user where username=?';
      const [results] = await connection.query(query, [username]);
      return results;
    } finally {
      connection.release();
    }
  },
  getAppPermit: async (appacronym) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        'SELECT App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create FROM application where App_Acronym=?';
      const [results] = await connection.query(query, [appacronym]);
      return results;
    } finally {
      connection.release();
    }
  },
  updateAppFromTask: async (apprnumber, appacronym) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = 'UPDATE application SET App_Rnumber=? WHERE App_Acronym=?';
      const [results] = await connection.query(query, [apprnumber, appacronym]);
      return results;
    } finally {
      connection.release();
    }
  },
  getAllTasks: async (appacronym) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        'SELECT * FROM task where Task_app_Acronym=?';

      const [results] = await connection.query(query, appacronym);
      return results;
    } finally {
      connection.release();
    }
  },
  getTaskNotes: async (taskid) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = 'SELECT Task_notes from task where Task_id=?';
      const [results] = await connection.query(query, taskid);
      return results;
    } finally {
      connection.release();
    }
  },
  createTask: async (taskObj) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = 'insert into task set ?';
      const [results] = await connection.query(query, taskObj);
      return results;
    } finally {
      connection.release();
    }
  },
  updateTaskState: async (state, taskid) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = 'UPDATE task set Task_state=? WHERE Task_id=?';
      const [results] = await connection.query(query, [state, taskid]);
      return results;
    } finally {
      connection.release();
    }
  },
  getPLEmail: async (usergroups) => {
    const format = '%.' + usergroups + '.%';
    const connection = await pool.promise().getConnection();
    try {
      const query = 'SELECT useremail FROM user WHERE usergroups LIKE ?';
      const [results] = await connection.query(query, [format]);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = a3Model;
