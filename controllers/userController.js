const User = require('../models/userModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');

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
          console.error('Error retrieving users:', error);
          res.status(500).json({
            success: false,
            error: 'Error retrieving users',
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
      console.error('Error in getAllUsers controller:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving users',
      });
    }
  },
};

module.exports = UserController;
