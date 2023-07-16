const User = require('../models/userModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const validationFn = require('../utils/validation');

exports.getProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.getProfile(req.userid);
  console.log(user);

  res.status(200).json({
    success: true,
    message: 'Here is the profile',
    data: user,
  });
});

exports.updateUser = catchAsyncError(async (req, res, next) => {
  // Validate if updated password modified meets specs
  validationFn.validatePassword(req.body.userpassword);

  let clauses = [];
  let values = [];
  for (const property in req.body) {
    if (
      property === 'userid' ||
      property === 'usergroup' ||
      property === 'userisActive' ||
      property === 'username'
    ) {
      res.status(400).json({
        success: false,
        meesage: 'Not Allowed to change.',
      });
    }
    clauses.push(property + '=?');
    values.push(req.body[property]);
  }
  if (values) {
    values.push(req.params.userid);
  }
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(',');
  const results = await User.updateUser(clauses, values);

  if (!results) {
    return next(new ErrorHandler('User not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'User is updated',
    data: `${results.affectedRows} row(s) is updated`,
  });
});

// For Roy to work on usergroup logic here.**************
// exports.createUser = catchAsyncError(async (req, res, next) => {
//   // Validation Checks
//   validationFn.validateEmptyFields(req.body);
//   // Pass in the userpassword to validate if it meets the specs
//   validationFn.validatePassword(req.body.userpassword);
//   // Need to amend some logic here before sending into mysql statement
//   const { username, useremail, userpassword, usergroup, userisActive } =
//     req.body;

//   const results = await User.createUser(
//     username,
//     hashedpassword,
//     useremail,
//     usergroup,
//     userisActive
//   );

//   res.status(200).json({
//     success: true,
//     message: "User is created",
//     data: `${results.affectedRows} row(s) is inserted`,
//   });
// });

// ADMIN GET ALL USERS
// exports.getAllUsers = catchAsyncError(async (req, res, next) => {
//   const users = await User.getAllUsers();

//   if (!users || users.length === 0) {
//     return next(new ErrorHandler("Unable to find any users", 404));
//   }
//   res.status(200).json({
//     success: true,
//     results: users.length,
//     data: users,
//   });
// });

// exports.loginUser = catchAsyncError(async (req, res, next) => {
//   const { username, userpassword } = req.body;
//   // No email or password handler before submitting to the model layer
//   if (!username || !userpassword) {
//     return next(new ErrorHandler(`Please enter username and Password`, 400));
//   }

//   // Sending to my model layer to start DB querying
//   const user = await User.loginUser(username);

//   // Check if there is user in database, if not return Invalid Email or Password
//   if (!user[0]) {
//     return next(new ErrorHandler("Invalid Email or Password", 401));
//   }
//   if (!user[0].userisActive) {
//     return next(new ErrorHandler("User is disabled", 403));
//   }

//   // Check if password is correct if not also return Invalid Email or Password
//   const hashedPasswordFromDB = user[0].userpassword;
//   const isPasswordMatched = await bcrypt.compare(
//     userpassword,
//     hashedPasswordFromDB
//   );
//   if (!isPasswordMatched) {
//     return next(new ErrorHandler(`Invalid Email or Password`, 401));
//   }
//   req.session.userid = user[0].userid;
//   sendToken(user, 200, res);
// });
