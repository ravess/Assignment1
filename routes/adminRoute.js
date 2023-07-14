const express = require("express");
const router = express.Router();
const { checkGroup, isUserLoggedIn } = require("../controllers/authController");
const {
  getAllUsers,
  createUser,
  updateUser,
} = require("../controllers/adminController");

router
  .route("/admin/users")
  .get(isUserLoggedIn, checkGroup("admin"), getAllUsers);
router
  .route("/admin/users/create")
  .post(isUserLoggedIn, checkGroup("admin"), createUser);
router.route("/admin/users/:userid/edit").put(isUserLoggedIn, updateUser);

module.exports = router;
