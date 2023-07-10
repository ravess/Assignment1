const jwt = require("jsonwebtoken");
const User = require("../models/users");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

// Check if the user is authenticated or not this will pull out req.user with the relevant id from login users
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
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

  req.user = await User.findById(decoded.id);

  next();
});

// handling users roles the ...roles when passed in with ('employer', 'admin') it
// it collects in an array ['employer', 'admin']

exports.authorizeRoles = (...roles) => {
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
