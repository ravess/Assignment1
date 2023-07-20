const Admin = require("../models/adminModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const validationFn = require("../utils/validation");
const bcrypt = require("bcryptjs");
const checkGroup = require("../utils/checkGroup");

// GET ALL USERS
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const result = await checkGroup(req.userid, "admin");
  if (!result[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 404)
    );
  }
  const users = await Admin.getAllUsers();
  if (!users || users.length === 0) {
    return next(new ErrorHandler("Unable to find any users", 404));
  }
  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  const user = await Admin.getUser(req.params.userid);
  console.log(user);
  if (!user || user.length === 0) {
    return next(new ErrorHandler("Unable to find any users", 404));
  }

  res.status(200).json({
    success: true,
    message: "Here is the profile",
    data: user,
  });
});

exports.createUser = catchAsyncError(async (req, res, next) => {
  validationFn.deleteEmptyFields(req.body);
  validationFn.validatePassword(req.body.userpassword);
  // Need to amend some logic here before sending into mysql statement
  const { username, useremail, userpassword, usergroup, userisActive } =
    req.body;

  if (!username || !userpassword || userisActive === null) {
    return next(
      new ErrorHandler(`Username,userpassword and userisActive is required`)
    );
  }
  const hashedpassword = await bcrypt.hash(userpassword, 15);

  const results = await Admin.createUser(
    username,
    hashedpassword,
    useremail,
    usergroup,
    userisActive
  );
  if (!results) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User is created",
    data: `${results.affectedRows} row(s) is inserted`,
  });
});

exports.updateUser = catchAsyncError(async (req, res, next) => {
  // Validate if updated password modified meets specs
  validationFn.deleteEmptyFields(req.body);
  if (req.body.userpassword) {
    await validationFn.validatePassword(req.body.userpassword);
    req.body.userpassword = await bcrypt.hash(req.body.userpassword, 10);
  }

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
  const results = await Admin.updateUser(clauses, values);

  if (!results) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "User is updated",
    data: `${results.affectedRows} row(s) is updated`,
  });
});

//Get all Existing groups
exports.getGroups = catchAsyncError(async (req, res, next) => {
  const groups = await Admin.getGroups();
  console.log(groups);
  if (!groups || groups.length === 0) {
    return next(new ErrorHandler("Unable to find any groups", 404));
  }
  res.status(200).json({
    success: true,
    results: groups.length,
    data: groups,
  });
});
exports.createGroup = async (req, res, next) => {
  const { usergroup } = req.body;
  const result = await Admin.createGroup(usergroup);
};
