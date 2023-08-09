const express = require('express');
const router = express.Router();
const { isUserLoggedIn } = require('../controllers/authController');
// const UserController = require("../controllers/userController");
const {
  getAllApps,
  updateApp,
  createApp,
  getAllTasks,
  updateTask,
  createTask,
  getAllPlans,
  createPlan,
  getApp,
  getTask,
  getPlan,
  updatePlan,
  getPlanColor,
} = require('../controllers/tmsController');

router.use(isUserLoggedIn);

router.route('/apps').get(getAllApps);
router.route('/apps/:appacronym').get(getApp);

router.route('/apps/:appacronym/edit').put(updateApp);
router.route('/apps/create').post(createApp);
router.route('/apps/:appacronym/tasks').get(getAllTasks);
router.route('/apps/:appacronym/tasks/:taskid').get(getTask);
router.route('/apps/:appacronym/tasks/:taskid/edit').put(updateTask);
router.route('/apps/:appacronym/tasks/create').post(createTask);
router.route('/apps/:appacronym/plans').get(getAllPlans);
router.route('/apps/:appacronym/plans/:planid').get(getPlan);
router.route('/apps/:appacronym/plans/:planid/edit').put(updatePlan);
router.route('/apps/:appacronym/plans/create').post(createPlan);
router.route('/getplancolor/:planid').get(getPlanColor);

module.exports = router;
