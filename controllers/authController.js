const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

// Logout User => /api/v1/logout

// Check if the user is authenticated or not this will pull out req.user with the relevant id from login users
exports.isUserLoggedIn = catchAsyncError(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // This handles for ensuring user is login to extract the id from token
  if (!token) {
    return next(new ErrorHandler("Login first to access this resource", 401));
  }
  //extracting the req.user.id from login token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [reqUser] = await User.getUser(decoded.id);
  req.userid = reqUser.userid;
  next();
});

exports.checkGroup = (...roles) => {
  return async (req, res, next) => {
    const rolesFiltered =
      "(" +
      roles.map((role) => `usergroup LIKE '%${role}%'`).join(" OR ") +
      ")";
    const user = await User.checkGroupUser(req.userid, rolesFiltered);
    console.log(user[0]);
    if (!user[0]) {
      return next(
        new ErrorHandler("You are not authorised to access this resource")
      );
    }
    next();
  };
};

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { username, userpassword } = req.body;
  // No email or password handler before submitting to the model layer
  if (!username || !userpassword) {
    return next(new ErrorHandler(`Please enter username and Password`, 400));
  }

  // Sending to my model layer to start DB querying
  const user = await User.loginUser(username);

  // Check if there is user in database, if not return Invalid Email or Password
  if (!user[0]) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }
  if (!user[0].userisActive) {
    return next(new ErrorHandler("User is disabled", 403));
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

exports.logout = catchAsyncError(async (req, res, next) => {
  const { userid } = req.session;

  // Clear the session for the user
  req.session.destroy();

  // Remove the user's active session from the tracking
  delete activeSessions[userid];
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});
