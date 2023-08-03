const dbConn = require("../config/databaseConfig");
const pool = dbConn.createConnPool();
// Create and send token and save in cookie
const checkGroup = async (username, usergroup) => {
  const format = "%." + usergroup + ".%";
  const connection = await pool.promise().getConnection();
  try {
    const query = `SELECT EXISTS (SELECT 1 FROM user WHERE username=? AND usergroup LIKE ?) as RESULT`;
    // select usergroup from acount where usergroup like '%.admin.%' and userid =72
    const [results] = await connection.query(query, [username, format]);
    return results;
  } finally {
    connection.release();
  }
};

module.exports = checkGroup;
