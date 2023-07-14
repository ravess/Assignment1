const express = require("express");
const { checkGroup } = require("../controllers/authController");
const {
  getAllUsers,
  createUser,
  updateUser,
} = require("../controllers/adminController");
const router = express.Router();

router
  .route("/admin/users")
  .get(isUserLoggedIn, checkGroup("admin"), getAllUsers);
router
  .route("/admin/users/create")
  .post(isUserLoggedIn, checkGroup("admin"), createUser);
router.route("/admin/users/:userid/edit").put(isUserLoggedIn, updateUser);
