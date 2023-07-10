const dbConfig = require("../config/databaseConfig");

// const config = require('../config/config');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

const UserModel = {
  // Need to amend the code based here.
  getAllUser: function (userId, callback) {
    dbConfig.getConnection((error, connection) => {
      if (error) {
        callback(error, null);
        return;
      }
      const query = "SELECT * FROM users WHERE id = ?";
      connection.query(query, [userId], (error, results) => {
        connection.release(); // Release the connection back to the pool
        if (error) {
          callback(error, null);
          return;
        }
        callback(null, results[0]); // Assuming a single user is expected
      });
    });
  },

  getUserById: function (userId, callback) {
    dbConfig.getConnection((error, connection) => {
      if (error) {
        callback(error, null);
        return;
      }
      const query = "SELECT * FROM users WHERE id = ?";
      connection.query(query, [userId], (error, results) => {
        connection.release(); // Release the connection back to the pool
        if (error) {
          callback(error, null);
          return;
        }
        callback(null, results[0]); // Assuming a single user is expected
      });
    });
  },
};

module.exports = UserModel;

/* const db = {
  getUsers: function (callback) {
    const dbConn = dbConfig.getConnection();

    dbConn.connect(function (err) {
      if (err) {
        return callback(err, null);
      } else {
        let sql = 'select * from user';

        dbConn.query(sql, [], function (err, results) {
          dbConn.end();
          return callback(err, results);
        });
      }
    });
  },

  get1User: function (userid, callback) {
    var dbConn = dbConfig.getConnection();

    dbConn.connect(function (err) {
      if (err) {
        return callback(err, null);
      } else {
        var sql = 'select * from user where userid=?';

        dbConn.query(sql, [userid], function (err, results) {
          dbConn.end();
          return callback(err, results);
        });
      }
    });
  },

  insertUser: function (username, email, role, password, callback) {
    var dbConn = dbConfig.getConnection();

    dbConn.connect(function (err) {
      var sql =
        'insert into user(username,email,role,password) values(?,?,?,?)';
      if (err) {
        return callback(err, null);
      } else {
        bcrypt.hash(password, 15, function (err, hash) {
          if (err) {
            return callback(err, null);
          } else {
            password = hash;
            dbConn.query(
              sql,
              [username, email, role, password],
              function (err, results) {
                dbConn.end();
                return callback(err, results);
              }
            );
          }
        });
      }
    });
  },

  updateUser: function (email, password, userid, callback) {
    var dbConn = dbConfig.getConnection();

    dbConn.connect(function (err) {
      if (err) {
        return callback(err, null);
      } else {
        var sql = 'update user set email=?,password=? where userid=?';

        dbConn.query(sql, [email, password, userid], function (err, results) {
          dbConn.end();
          return callback(err, results);
        });
      }
    });
  },

  deleteUser: function (userid, callback) {
    var dbConn = dbConfig.getConnection();

    dbConn.connect(function (err) {
      if (err) {
        return callback(err, null);
      } else {
        var sql = 'delete from user where userid=?';

        dbConn.query(sql, [userid], function (err, results) {
          dbConn.end();
          return callback(err, results);
        });
      }
    });
  },
  loginUser: function (email, password, callback) {
    var dbConn = dbConfig.getConnection();

    dbConn.connect(function (err) {
      if (err) {
        return callback(err, null);
      } else {
        var sql = 'select * from user where email=?';
        dbConn.query(sql, email, function (err, results) {
          dbConn.end();
          if (err) {
            return callback(err, null);
          } else {
            var token = '';
            if (results.length == 1) {
              //imply such a user was found
              bcrypt.compare(
                password,
                results[0].password,
                function (err, result) {
                  if (err) {
                    return callback(err, null);
                  } else {
                    result
                      ? (token = jwt.sign(
                          {
                            'userid': results[0].userID,
                            'role': results[0].role,
                          },
                          config.secretKey,
                          {
                            expiresIn: 43200,
                          }
                        ))
                      : (token = '');
                  }
                  return callback(null, token);
                }
              );
            } else {
              return callback(err, '');
            }
          }
        });
      }
    });
  },
};

module.exports = db; */
