const jwt = require('jsonwebtoken');
const Auth = require('../models/authModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const bcrypt = require('bcryptjs');
const sendToken = require('../utils/jwtToken');
// const { v4: uuidv4 } = require('uuid');

// Logout User => /api/v1/logout

// Check if the user is authenticated or not this will pull out req.user with the relevant id from login users
exports.isUserLoggedIn = catchAsyncError(async (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);
  console.log(`it came to authentication backend`);
  // console.log(req.headers.authorization);
  // const token = req.headers.authorization?.split(" ")[1];
  // This handles for ensuring user is login to extract the id from token
  if (!token) {
    console.log(`no token`);
    return next(new ErrorHandler('Login first to access this resource', 401));
  }
  //extracting the req.user.id from login token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userID = decoded.id;
  req.userid = userID;
  next();
});

// Javascript closure where the return function has access to the variable declared within the parent function.
exports.checkGroup = (...roles) => {
  const rolesFiltered =
    '(' + roles.map((role) => `usergroup LIKE '%${role}%'`).join(' OR ') + ')';
  // The below will replace my checkgroup() function and makes it a middleware function which has
  return catchAsyncError(async (req, res, next) => {
    const user = await Auth.checkGroup(req.userid, rolesFiltered);
    if (!user[0]) {
      return next(
        new ErrorHandler('You are not authorised to access this resource', 403)
      );
    }
    next();
  });
};

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { username, userpassword } = req.body;

  // No email or password handler before submitting to the model layer
  if (!username || !userpassword) {
    return next(new ErrorHandler(`Please enter username and Password`, 400));
  }

  // Sending to my model layer to start DB querying
  const user = await Auth.loginUser(username);

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
  // Check if user is disabled
  if (!user[0].userisActive) {
    return next(new ErrorHandler('User is disabled', 403));
  }

  sendToken(user, 200, res);
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
