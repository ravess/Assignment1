const jwt = require("jsonwebtoken");
// Create and send token and save in cookie
const sendToken = (user, statusCode, res) => {
  // Create JWT Token
  const token = jwt.sign({ id: user[0].userid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
  };
  console.log(token, `from sendToken`);
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true });
};

module.exports = sendToken;
