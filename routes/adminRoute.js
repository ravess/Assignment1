const express = require('express');
const router = express.Router();
const { isUserLoggedIn } = require('../controllers/authController');
const {
  getAllUsers,
  createUser,
  updateUser,
  getUser,
  getGroups,
  createGroup,
} = require('../controllers/adminController');

router.use(isUserLoggedIn);

router.route('/admin/users').post(getAllUsers);
// router.route('/admin/groups').post(getGroups);
router.route('/admin/groups/create').post(createGroup);
router.route('/admin/user/:userid').post(getUser);
router.route('/admin/users/create').post(createUser);
router.route('/admin/users/:userid/edit').put(updateUser);

module.exports = router;
