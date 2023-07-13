const express = require("express");
const router = express.Router();

// const UserController = require("../controllers/userController");
const {
  getAllUsers,
  loginUser,
  updateUser,
  createUser,
} = require("../controllers/userController");
const { isLoggedIn } = require("../controllers/authController");

// User Login Routes
router.route("/").get(getAllUsers);
router.route("/login").post(loginUser);
router.route("/user/:userid").put(isLoggedIn, updateUser);
router.route("/user/register").post(createUser);

module.exports = router;
