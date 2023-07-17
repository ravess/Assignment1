const express = require("express");
const router = express.Router();

const {
  logout,
  isUserLoggedIn,
  loginUser,
} = require("../controllers/authController");

router.route("/login").post(loginUser);
router.route("/logout").get(isUserLoggedIn, logout);

module.exports = router;
