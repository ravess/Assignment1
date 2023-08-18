const express = require("express");
const router = express.Router();
const { isUserLoggedIn } = require("../controllers/authController");
const {
  getAllUsers,
  createUser,
  updateUser,
  getUser,
  createGroup,
} = require("../controllers/adminController");

router.route("/admin/users").post(isUserLoggedIn, getAllUsers);
// router.route("/admin/groups").post(getGroups);
router.route("/admin/groups/create").post(isUserLoggedIn, createGroup);
router.route("/admin/user/:userid").post(isUserLoggedIn, getUser);
router.route("/admin/users/create").post(isUserLoggedIn, createUser);
router.route("/admin/users/:userid/edit").put(isUserLoggedIn, updateUser);

module.exports = router;
