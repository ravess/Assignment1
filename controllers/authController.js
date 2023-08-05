const jwt = require('jsonwebtoken');
const Auth = require('../models/authModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const bcrypt = require('bcryptjs');
const sendToken = require('../utils/jwtToken');
const checkGroup = require('../utils/checkGroup');
// const { v4: uuidv4 } = require('uuid');

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { username, userpassword } = req.body;
  // No email or password handler before submitting to the model layer
  if (!username || !userpassword) {
    return next(new ErrorHandler(`Please enter username and Password`, 403));
  }
  // Sending to my model layer to start DB querying
  const user = await Auth.loginUser(username);
  // Check if there is user in database, if not return Invalid Email or Password
  if (!user[0]) {
    return next(new ErrorHandler('Invalid Email or Password', 403));
  }

  // Check if password is correct if not also return Invalid Email or Password
  const hashedPasswordFromDB = user[0].userpassword;
  const isPasswordMatched = await bcrypt.compare(
    userpassword,
    hashedPasswordFromDB
  );
  if (!isPasswordMatched) {
    return next(new ErrorHandler(`Invalid Email or Password`, 403));
  }
  // Check if user is disabled
  if (!user[0].userisActive) {
    return next(new ErrorHandler('User is disabled', 403));
  }
  sendToken(user, 200, res);
});
// Check if the user is authenticated or not this will pull out req.user with the relevant id from login users
exports.isUserLoggedIn = catchAsyncError(async (req, res, next) => {
  const token = req.cookies.token;

  // To use for postman
  // let token;

  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith("Bearer")
  // ) {
  //   token = req.headers.authorization.split(" ")[1];
  // }

  if (!token) {
    return next(new ErrorHandler('Login first to access this resource', 403));
  }
  //extracting the req.user.id from login token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.username = decoded.username;
  const userInfo = await Auth.getUser(req.username);
  if (req.username !== userInfo[0].username) {
    return next(new ErrorHandler('Invalid User', 403));
  }
  if (!userInfo[0].userisActive) {
    return next(new ErrorHandler('User is disabled', 403));
  }

  next();
});

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

exports.checkgroup = catchAsyncError(async (req, res, next) => {
  const results = await checkGroup(req.username, req.body.usergroup);
  if (!results[0].RESULT) {
    return next(
      new ErrorHandler('You are not authorised to access this resource', 401)
    );
  }

  // If there's no next middleware, proceed to send the response
  res.status(200).json({
    success: true,
    data: results[0].RESULT,
  });
});
