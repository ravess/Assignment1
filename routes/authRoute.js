const express = require("express");
const router = express.Router();

const {
  logout,
  isUserLoggedIn,
  loginUser,
  checkGroup,
} = require("../controllers/authController");

router.route("/login").post(loginUser);
router.route("/logout").get(isUserLoggedIn, logout);
router.route("/checkgroup").get(isUserLoggedIn, checkGroup);

module.exports = router;
