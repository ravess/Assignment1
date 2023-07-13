const express = require("express");
const router = express.Router();

// const UserController = require("../controllers/userController");
const {
  getAllUsers,
  loginUser,
  updateUser,
  createUser,
} = require("../controllers/userController");
const {
  isAuthenticateUser,
  checkGroup,
} = require("../controllers/authController");

// User Login Routes
router.route("/").get(isAuthenticateUser, checkGroup, getAllUsers);
router.route("/login").post(loginUser);
router.route("/user/:userid").put(isAuthenticateUser, updateUser);
router.route("/user/register").post(createUser);

module.exports = router;
