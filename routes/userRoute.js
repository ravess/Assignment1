const express = require("express");
const router = express.Router();

// const UserController = require("../controllers/userController");
const { updateUser, getProfile } = require("../controllers/userController");
const { isUserLoggedIn } = require("../controllers/authController");

// User Login Routes
// router.route("/user/dashboard").get();
router.route("/user/profile").get(isUserLoggedIn, getProfile);
router.route("/user/profile/edit").put(isUserLoggedIn, updateUser);

module.exports = router;
