const jwt = require('jsonwebtoken');
const Auth = require('../models/authModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const bcrypt = require('bcryptjs');
const sendToken = require('../utils/jwtToken');

// Logout User => /api/v1/logout

// Check if the user is authenticated or not this will pull out req.user with the relevant id from login users
exports.isUserLoggedIn = catchAsyncError(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // This handles for ensuring user is login to extract the id from token
  if (!token) {
    return next(new ErrorHandler('Login first to access this resource', 401));
  }
  //extracting the req.user.id from login token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userID = decoded.id;

  // Check if the session identifier exists in the activeSessions tracking object
  if (
    !req.session ||
    !req.session.sessionID ||
    req.activeSessions[req.session.sessionID] !== userID
  ) {
    return next(
      new ErrorHandler(
        'Invalid session. Login again to access this resource',
        401
      )
    );
  }
  // Store the user ID in the request object for further processing
  req.userid = userID;

  next();
});

// Javascript closure where the return function has access to the variable declared within the parent function.
exports.checkGroup = (...roles) => {
  const rolesFiltered =
    '(' + roles.map((role) => `usergroup LIKE '%${role}%'`).join(' OR ') + ')';
  // The below will replace my checkgroup() function and makes it a middleware function which has
  return catchAsyncError(async (req, res, next) => {
    const user = await Auth.checkGroupUser(req.userid, rolesFiltered);
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
  // Generate a unique session identifier
  const sessionID = uuidv4();
  // Store the session identifier in the user's session object
  req.session.sessionID = sessionID;
  req.activeSessions[sessionID] = user[0].userid;

  sendToken(user, 200, res);
});

exports.logout = catchAsyncError(async (req, res, next) => {
  const { sessionID } = req.session;

  // Remove the user's session identifier from the activeSessions tracking object
  delete req.activeSessions[sessionID];

  // Clear the session for the user
  req.session.destroy();
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});
