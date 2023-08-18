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
  updatePlan,
  getPlanColor,
} = require("../controllers/tmsController");

router.route("/apps").get(isUserLoggedIn, getAllApps);
router.route("/apps/:appacronym").get(isUserLoggedIn, getApp);

router.route("/apps/:appacronym/edit").put(isUserLoggedIn, updateApp);
router.route("/apps/create").post(isUserLoggedIn, createApp);
router.route("/apps/:appacronym/tasks").get(isUserLoggedIn, getAllTasks);
router.route("/apps/:appacronym/tasks/:taskid").get(isUserLoggedIn, getTask);
router
  .route("/apps/:appacronym/tasks/:taskid/edit")
  .put(isUserLoggedIn, updateTask);
router.route("/apps/:appacronym/tasks/create").post(isUserLoggedIn, createTask);
router.route("/apps/:appacronym/plans").get(isUserLoggedIn, getAllPlans);
router.route("/apps/:appacronym/plans/:planid").get(isUserLoggedIn, getPlan);
router
  .route("/apps/:appacronym/plans/:planid/edit")
  .put(isUserLoggedIn, updatePlan);
router.route("/apps/:appacronym/plans/create").post(isUserLoggedIn, createPlan);
router.route("/getplancolor/:planid").get(isUserLoggedIn, getPlanColor);

module.exports = router;
