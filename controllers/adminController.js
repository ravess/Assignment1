const Admin = require('../models/adminModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const validationFn = require('../utils/validation');
const bcrypt = require('bcryptjs');

// GET ALL USERS
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await Admin.getAllUsers();
  if (!users || users.length === 0) {
    return next(new ErrorHandler('Unable to find any users', 404));
  }
  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

exports.createUser = catchAsyncError(async (req, res, next) => {
  // Validation Checks
  validationFn.validateEmptyFields(req.body);
  // Pass in the userpassword to validate if it meets the specs
  validationFn.validatePassword(req.body.userpassword);
  // Need to amend some logic here before sending into mysql statement
  const { username, useremail, userpassword, usergroup, userisActive } =
    req.body;
  const hashedpassword = await bcrypt.hash(userpassword, 15);

  const results = await Admin.createUser(
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

exports.updateUser = catchAsyncError(async (req, res, next) => {
  // Validate if updated password modified meets specs
  console.log(typeof req.params.userid);
  if (req.body.userpassword) {
    validationFn.validatePassword(req.body.userpassword);
  }

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
  const results = await Admin.updateUser(clauses, values);

  if (!results) {
    return next(new ErrorHandler('User not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'User is updated',
    data: `${results.affectedRows} row(s) is updated`,
  });
});
