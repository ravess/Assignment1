const User = require('../models/userModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const bcrypt = require('bcryptjs');

// GET ALL USERS
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.getAllUsers();

  if (!users || users.length === 0) {
    return next(new ErrorHandler('Unable to find any users', 404));
  }
  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { username, userpassword } = req.body;
  // No email or password handler before submitting to the model layer
  if (!username || !userpassword) {
    return next(new ErrorHandler(`Please enter username and Password`, 400));
  }

  //
  const user = await User.loginUser(username);

  // Check if there is user in database, if not return Invalid Email or Password
  if (!user[0]) {
    return next(new ErrorHandler('Invalid Email or Password', 401));
  }

  // Check if password is correct if not also return Invalid Email or Password
  const hashedPasswordFromDB = user[0].userpassword;
  const isPasswordMatched = await bcrypt.compare(
    userpassword,
    hashedPasswordFromDB
  );
  if (!isPasswordMatched) {
    return next(new ErrorHandler(`Invalid Email or Password`, 401));
  }
  req.session.userid = user[0].userid;
  sendToken(user, 200, res);
});

exports.updateUser = catchAsyncError(async (req, res, next) => {
  let clauses = [];
  let values = [];
  for (const property in req.body) {
    if (property === 'userid') {
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
exports.createUser = catchAsyncError(async (req, res, next) => {
  // Need to amend some logic here before sending into mysql statement
  const { username, useremail, userpassword, usergroup, userisActive } =
    req.body;

  const rePassword = new RegExp(
    '^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,10}$'
  );

  if (!rePassword.test(userpassword)) {
    return next(
      new ErrorHandler(
        'You are require to set the pw which have min 8 chars & max 10 chars which is alphanumeric and a special char',
        400
      )
    );
  }

  // Need come back check if User exist, maybe through validation middleware?
  // const existingUser = await User.getUserByUsernameOrEmail(username, useremail);
  // if (existingUser) {
  //   return next(new ErrorHandler('Username or email already exists', 409));
  // }

  const hashedpassword = await bcrypt.hash(userpassword, 15);
  const results = await User.createUser(
    username,
    hashedpassword,
    useremail,
    usergroup,
    userisActive
  );

  res.status(200).json({
    success: true,
    message: 'User is created',
    data: `${results.affectedRows} row(s) is inserted`,
  });
});
