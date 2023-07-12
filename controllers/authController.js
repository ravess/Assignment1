const catchAsyncError = require('../middlewares/catchAsyncError');

// Logout User => /api/v1/logout
//

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});
