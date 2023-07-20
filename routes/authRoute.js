const express = require("express");
const router = express.Router();

const {
  logout,
  isUserLoggedIn,
  loginUser,
  checkAdmin,
} = require("../controllers/authController");

router.route("/login").post(loginUser);
router.route("/logout").get(isUserLoggedIn, logout);
router.route("/checkgroup").get(isUserLoggedIn, checkAdmin);

module.exports = router;
