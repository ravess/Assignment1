const express = require("express");
const router = express.Router();
const {
  createTask,
  getTaskByState,
  promoteTask2Done,
} = require("../controllers/a3Controller");

router.route("/createTask").post(createTask);
router.route("/getTaskByState").put(getTaskByState);
router.route("/promoteTask2Done").put(promoteTask2Done);

module.exports = router;
