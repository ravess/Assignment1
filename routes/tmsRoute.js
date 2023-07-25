const express = require("express");
const router = express.Router();
const { isUserLoggedIn } = require("../controllers/authController");
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
} = require("../controllers/tmsController");
const { updatePlan } = require("../models/tmsModel");

router.use(isUserLoggedIn);

router.route("/apps").get(getAllApps);
router.route("/apps/:appid").get(getApp);
router.route("/apps/:appid/edit").put(updateApp);
router.route("/apps/create").post(createApp);
router.route("/tasks").get(getAllTasks);
router.route("/tasks/:taskid").get(getTask);
router.route("/tasks/:taskid/edit").put(updateTask);
router.route("/tasks/create").post(createTask);
router.route("/plans").get(getAllPlans);
router.route("/plans/:planid").get(getPlan);
router.route("/plans/:planid/edit").put(updatePlan);
router.route("/plans/create").post(createPlan);

module.exports = router;
