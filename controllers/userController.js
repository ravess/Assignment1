const User = require('../models/userModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const validationFn = require('../utils/validation');
const bcrypt = require('bcryptjs');

exports.getProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.getProfile(req.username);
  if (!user) {
    return next(new ErrorHandler('User not found', 403));
  }

  res.status(200).json({
    success: true,
    message: 'Here is the profile',
    data: user,
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
    if (
      property === 'usergroups' ||
      property === 'userisActive' ||
      property === 'username'
    ) {
      res.status(404).json({
        success: false,
        meesage: 'Not Allowed to change.',
      });
    }
    clauses.push(property + '=?');
    values.push(req.body[property]);
  }
  if (values) {
    values.push(req.username);
  }
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(',');

  const results = await User.updateUser(clauses, values);
  if (!results) {
    return next(new ErrorHandler('User not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'User is updated',
    data: `${results.affectedRows} row(s) is updated`,
  });
});

exports.getGroups = catchAsyncError(async (req, res, next) => {
  const groups = await User.getGroups();
  if (!groups || groups.length === 0) {
    return next(new ErrorHandler('Unable to find any groups', 404));
  }
  res.status(200).json({
    success: true,
    results: groups.length,
    data: groups,
  });
});
