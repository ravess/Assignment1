const express = require("express");
const router = express.Router();

const {
  logout,
  isUserLoggedIn,
  loginUser,
  checkgroup,
} = require("../controllers/authController");

router.route("/login").post(loginUser);
router.route("/logout").get(isUserLoggedIn, logout);
router.route("/checkgroup").get(isUserLoggedIn, checkgroup);

module.exports = router;
