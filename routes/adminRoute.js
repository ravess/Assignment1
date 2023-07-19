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

router
  .route("/admin/users")
  .get(isUserLoggedIn, checkGroup("admin"), getAllUsers);
router
  .route("/admin/groups")
  .get(isUserLoggedIn, checkGroup("admin"), getGroups);
router
  .route("/admin/user/:userid")
  .get(isUserLoggedIn, checkGroup("admin"), getUser);
router
  .route("/admin/users/create")
  .post(isUserLoggedIn, checkGroup("admin"), createUser);
router
  .route("/admin/users/:userid/edit")
  .put(isUserLoggedIn, checkGroup("admin"), updateUser);

module.exports = router;
