const dbConn = require('../config/databaseConfig');
const pool = dbConn.createConnPool();

const tmsModel = {
  getAllApps: async () => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        'SELECT App_Acronym FROM application';
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  getApp: async (appAcronymID) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        'SELECT * FROM application where App_Acronym=?';
      const [results] = await connection.query(query, [appAcronymID]);
      return results;
    } finally {
      connection.release();
    }
  },
  createApp: async (appObj) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        'INSERT INTO application SET ?';
      const [results] = await connection.query(query, [appObj]);
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
        'UPDATE application SET ' + clauses + ' WHERE App_Acronym=?';
      const [results] = await connection.query(query, values);
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
  getAllPlans: async () => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        'SELECT Plan_MVP_name FROM plan';
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  getPlan: async (mvpparams) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        'SELECT * FROM plan where Plan_MVP_name=?';
      const [results] = await connection.query(query, [mvpparams]);
      return results;
    } finally {
      connection.release();
    }
  },
  createPlan: async (planObj) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        //Need change the query
        'insert into plan set ?';
      const [results] = await connection.query(query, [planObj]);
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
        'UPDATE plan SET ' + clauses + ' WHERE Plan_MVP_name=?';
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
        'SELECT * FROM task';
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  getTask: async (clauses, values) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = 'SELECT * from task where task_name=?';
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },
  createTask: async (taskObj) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = 'insert into task set ?';
      const [results] = await connection.query(query, [taskObj]);
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
        'UPDATE user SET ' + clauses + ' WHERE userid=?';
      const [results] = await connection.query(query, values);
      return results;
    } finally {
      connection.release();
    }
  },
};

module.exports = tmsModel;
