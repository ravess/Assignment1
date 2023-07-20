const express = require("express");
const router = express.Router();
const { checkGroup, isUserLoggedIn } = require("../controllers/authController");
const {
  getAllUsers,
  createUser,
  updateUser,
  getUser,
  getGroups,
} = require("../controllers/adminController");

router.route("/admin/users").get(isUserLoggedIn, getAllUsers);
router.route("/admin/groups").get(isUserLoggedIn, getGroups);
router.route("/admin/user/:userid").get(isUserLoggedIn, getUser);
router.route("/admin/users/create").post(isUserLoggedIn, createUser);
router.route("/admin/users/:userid/edit").put(isUserLoggedIn, updateUser);

module.exports = router;
