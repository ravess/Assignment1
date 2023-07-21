const dbConn = require('../config/databaseConfig');
const pool = dbConn.createConnPool();
// Create and send token and save in cookie
const checkRole = async (userid, usergroup) => {
  const format = '%.' + usergroup + '.%';
  const connection = await pool.promise().getConnection();
  try {
    const query = `SELECT EXISTS (SELECT 1 FROM user WHERE userid=? AND usergroup LIKE ?) as RESULT`;
    // select usergroup from acount where usergroup like '%.admin.%' and userid =72
    const [results] = await connection.query(query, [userid, format]);
    return results;
  } finally {
    connection.release();
  }
};

module.exports = checkRole;
