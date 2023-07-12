const User = require("../models/userModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");

// GET ALL USERS
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.getAllUsers();

  if (!users || users.length === 0) {
    return next(new ErrorHandler("Unable to find any users", 404));
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

  // Need to resolve login bug why when there is no user
  const user = await User.loginUser(username, userpassword);

  // Check if there is user in database
  console.log(Boolean(user));
  console.log(typeof user);
  console.log(user);
  if (!user[0]) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  // Check if password is correct
  // const isPasswordMatched = await user.comparePassword(password);
  // if (!isPasswordMatched) {
  //   return next(new ErrorHandler(`Invalid Email or Password`, 401));
  // }
  sendToken(user, 200, res);
});

exports.updateUser = catchAsyncError(async (req, res, next) => {
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
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(",");
  const results = await User.updateUser(clauses, values);

  if (!results) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "User is updated",
    data: `${results.affectedRows} row(s) is updated`,
  });
});

// For Roy to work on
exports.createUser = catchAsyncError(async (req, res, next) => {
  // Need to amend some logic here before sending into mysql statement
  const { username, useremail, userpassword, usergroup, userisActive } =
    req.body;

  const results = await User.createUser(
    username,
    userpassword,
    useremail,
    usergroup,
    userisActive
  );

  res.status(200).json({
    success: true,
    message: "User is created",
    data: `${results.affectedRows} row(s) is inserted`,
  });
});
