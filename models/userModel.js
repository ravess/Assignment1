const dbConn = require("../config/databaseConfig");
const pool = dbConn.createConnPool();

const UserModel = {
  getAllUsers: async () => {
    const connection = await pool.promise().getConnection();
    try {
      const query = "SELECT username FROM accounts";
      const [results] = await connection.query(query);
      return results;
    } finally {
      connection.release();
    }
  },
  getUser: async (userid) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = "SELECT userid, usergroup FROM accounts where userid=?";
      const [results] = await connection.query(query, [userid]);
      return results;
    } finally {
      connection.release();
    }
  },
  loginUser: async (username) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        "SELECT userid, userpassword FROM accounts where username=?";
      const [results] = await connection.query(query, [username]);
      return results;
    } finally {
      connection.release();
    }
  },
  updateUser: async (clauses, values) => {
    const connection = await pool.promise().getConnection();
    try {
      const query = `UPDATE accounts SET ${clauses} WHERE userid=?`;
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
    usergroup,
    userisActive
  ) => {
    const connection = await pool.promise().getConnection();

    try {
      const query =
        "insert into accounts(username,userpassword,useremail,usergroup,userisActive) values(?,?,?,?,?)";
      const [results] = await connection.query(query, [
        username,
        hashedpassword,
        useremail,
        usergroup,
        userisActive,
      ]);
      return results;
    } finally {
      connection.release();
    }
  },
  checkGroupUser: async (userid, usergroup) => {
    const connection = await pool.promise().getConnection();
    try {
      const query =
        "select usergroup from accounts where userid=? AND `group` LIKE CONCAT('%', ?, '%')";
      const [results] = await connection.query(query, [userid, usergroup]);
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

module.exports = UserModel;
