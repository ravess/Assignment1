const User = require("../models/userModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

// GET ALL USERS
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.getAllUsers();

  if (!users) {
    return next(new ErrorHandler("Unable to find any users", 404));
  }

  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

// 1. Since database has admin account
// POST LOGIN
exports.loginUser = catchAsyncError(async (req, res) => {
  const { username, password } = req.body;

  const user = User.loginUser;

  /* 
    if (username === "bob" && password === "1234") {
      req.session.isLoggedIn = true;
      res.redirect(req.query.redirect_url ? req.query.redirect_url : "/");
    } else {
      res.render("login", { error: "Username or password is incorrect" });
    } */
});

//
// GET REQUEST FOR LOGIN PAGE
exports.authenticateUser = (req, res) => {
  if (req.session.isLoggedIn === true) {
    return res.redirect("/");
  }
  res.render("login", { error: false });
};
