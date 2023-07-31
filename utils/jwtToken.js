const jwt = require("jsonwebtoken");
// Create and send token and save in cookie
const sendToken = (user, statusCode, res) => {
  // Create JWT Token
  const token = jwt.sign(
    { username: user[0].username },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    }
  );
  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: "localhost",
    path: "/",
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

module.exports = sendToken;
