const express = require('express');
const router = express.Router();
const { isUserLoggedIn, checkgroup } = require('../controllers/authController');
const {
  getAllUsers,
  createUser,
  updateUser,
  getUser,
  getGroups,
  createGroup,
} = require('../controllers/adminController');

router.use(isUserLoggedIn);

router.route('/admin/users').get(checkgroup, getAllUsers);
router.route('/admin/groups').get(checkgroup, getGroups);
router.route('/admin/groups/create').post(checkgroup, createGroup);
router.route('/admin/user/:userid').get(checkgroup, getUser);
router.route('/admin/users/create').post(checkgroup, createUser);
router.route('/admin/users/:userid/edit').put(checkgroup, updateUser);

module.exports = router;
