const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

// Logout User => /api/v1/logout

// Check if the user is authenticated or not this will pull out req.user with the relevant id from login users
exports.isLoggedIn = catchAsyncError(async (req, res, next) => {
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
  req.user = await User.getUser(decoded.id);
  next();
});

exports.checkGroup = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role(${req.user.role}) is not allowed to access this resource.`,
          403
        )
      );
    }
    next();
  };
};

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
