const express = require("express");
const router = express.Router();

const UserController = require("../controllers/userController");

// User Login Routes
router.route("/").get(UserController.getAllUsers);
router.route("/login").post(UserController.loginUser);

module.exports = router;
