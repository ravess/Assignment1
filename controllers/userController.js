const User = require("../models/userModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const validationFn = require("../utils/validation");

exports.getProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.getProfile(req.userid);
  console.log(user);

  res.status(200).json({
    success: true,
    message: "Here is the profile",
    data: user,
  });
});

exports.updateUser = catchAsyncError(async (req, res, next) => {
  // Validate if updated password modified meets specs
  validationFn.validatePassword(req.body.userpassword);

  let clauses = [];
  let values = [];
  for (const property in req.body) {
    if (
      property === "userid" ||
      property === "usergroup" ||
      property === "userisActive" ||
      property === "username"
    ) {
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
