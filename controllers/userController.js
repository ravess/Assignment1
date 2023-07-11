const User = require("../models/userModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

// GET ALL USERS
// exports.getAllUsers = catchAsyncError(async (req, res, next) => {
//   const users = await User.getAllUsers();
//   console.log(users);

//   if (!users || users.length === 0) {
//     return next(new ErrorHandler('Unable to find any users', 404));
//   }
//   res.status(200).json({
//     success: true,
//     results: users.length,
//     data: users,
//   });
// });

const UserController = {
  getAllUsers: (req, res) => {
    try {
      User.getAllUsers((error, users) => {
        if (error) {
          console.error("Error retrieving users:", error);
          res.status(500).json({
            success: false,
          });
          return;
        }

        res.status(200).json({
          success: true,
          results: users.length,
          data: users,
        });
      });
    } catch (error) {
      console.error("Error in getAllUsers controller:", error);
      res.status(500).json({
        success: false,
        error: "Error retrieving users",
      });
    }
  },
  loginUser: (req, res) => {
    const { username, password } = req.body;
    try {
      User.loginUser(username, password, (error, user) => {
        if (error) {
          console.error("Error retrieving users:", error);
          res.status(500).json({
            success: false,
            error: "Error retrieving all users",
          });
          return;
        }
        res.status(200).json({
          success: true,
          user,
        });
      });
    } catch (error) {
      console.error("Error in loginUser controller:", error);
      res.status(500).json({
        success: false,
        error: "Error loginIn users",
      });
    }
  },
  updateUser: (req, res) => {
    let clauses = [];
    let values = [];
    for (const property in req.body) {
      if (property === "userid") {
        res.status(400).json({
          success: false,
          meesage: "Not Allowed to change.",
        });
      }
      clauses.push(property + "=?");
      values.push(req.body[property]);
    }
    if (values) {
      values.push(req.params.userid);
    }
    // This is to allow me to dynamic to accept any json values
    clauses = clauses.join(",");
    User.updateUser(clauses, values, (error, results) => {
      if (error) {
        res.status(400).json({
          success: false,
          meesage: "Not Allowed to change.",
        });
      }
      res.status(200).json({
        success: true,
        message: "User Updated",
      });
    });
  },
  insertUser: (req, res) => {
    //Need to amend the usergroup logic here
    const { username, usergroup, userpassword, useremail } = req.body;
    //Come back and do the logic later
    User.insertUser(
      username,
      usergroup,
      userpassword,
      useremail,
      (error, results) => {
        if (error) {
          res.status(400).json({
            success: false,
            message: "Unable to create new User",
          });
        }
        res.status(200).json({
          success: true,
          message: `${results.affectedRows} row(s) inserted`,
        });
      }
    );
  },
};

module.exports = UserController;
