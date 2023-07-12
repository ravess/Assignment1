const catchAsyncError = require('../middlewares/catchAsyncError');

// Logout User => /api/v1/logout
//

exports.logout = catchAsyncError(async (req, res, next) => {
  const { userid } = req.session;

  // Clear the session for the user
  req.session.destroy();

  // Remove the user's active session from the tracking
  delete activeSessions[userid];
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});
