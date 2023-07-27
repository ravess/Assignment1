const catchAsyncError = require("../middlewares/catchAsyncError");
const validationFn = require("../utils/validation");
const TMS = require("../models/tmsModel");
const checkGroup = require("../utils/checkGroup");

// For App
exports.getAllApps = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  const apps = await TMS.getAllApps();

  if (!apps || apps.length === 0) {
    return next(new ErrorHandler("Unable to find any apps", 404));
  }

  const formattedApps = apps.map((app) => {
    return {
      ...app,
      App_startDate: app.App_startDate
        ? app.App_startDate.toISOString().slice(0, 10)
        : null,
      App_endDate: app.App_endDate
        ? app.App_endDate.toISOString().slice(0, 10)
        : null,
    };
  });

  res.status(200).json({
    success: true,
    results: apps.length,
    data: formattedApps,
  });
});

exports.getApp = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  const app = await TMS.getApp(req.params.appacronym);
  if (!app || app.length === 0) {
    return next(new ErrorHandler("Unable to find app", 404));
  }

  res.status(200).json({
    success: true,
    message: "Here is the app details",
    data: app,
  });
});

exports.createApp = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  validationFn.changeEmptyFieldsToNull(req.body);
  validationFn.removewhitespaces(req.body);
  // Need to amend some logic here before sending into mysql statement****

  if (
    !req.body.App_Acronym ||
    !req.body.App_Description ||
    !req.body.App_Rnumber === null
  ) {
    return next(
      new ErrorHandler(`appacronym, appdescription and apprNumber is required`)
    );
  }

  const results = await TMS.createApp(req.body);
  if (!results) {
    return next(new ErrorHandler("Unable to create App", 404));
  }

  res.status(200).json({
    success: true,
    message: "App is created",
    data: `${results.affectedRows} row(s) is inserted`,
  });
});

exports.updateApp = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  validationFn.deleteEmptyFields(req.body);

  let clauses = [];
  let values = [];
  for (const property in req.body) {
    if (property === "App_Acronym") {
      res.status(400).json({
        success: false,
        meesage: "Not Allowed to change.",
      });
    }
    clauses.push(property + "=?");
    values.push(req.body[property]);
  }
  if (values) {
    values.push(req.params.appacronym);
  }
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(",");
  const results = await TMS.updateApp(clauses, values);

  if (!results) {
    return next(new ErrorHandler("Unable to update App", 404));
  }
  res.status(200).json({
    success: true,
    message: "App is updated",
    data: `${results.affectedRows} row(s) is updated`,
  });
});

// For Plan
exports.getAllPlans = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  const plans = await TMS.getAllPlans();
  if (!plans || plans.length === 0) {
    return next(new ErrorHandler("Unable to find any plans", 404));
  }
  res.status(200).json({
    success: true,
    results: plans.length,
    data: plans,
  });
});

exports.getPlan = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }

  const plan = await TMS.getPlan(req.params.planid);
  if (!plan || plan.length === 0) {
    return next(new ErrorHandler("Unable to find plan", 404));
  }

  res.status(200).json({
    success: true,
    message: "Here is the plan details",
    data: plan,
  });
});

exports.createPlan = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  validationFn.changeEmptyFieldsToNull(req.body);
  validationFn.removewhitespaces(req.body);
  req.body.Plan_app_Acronym = req.params.appacronym;
  // Need to amend some logic here before sending into mysql statement****

  if (!req.body.Plan_MVP_name || !req.body.Plan_app_Acronym === null) {
    return next(new ErrorHandler(`Something is required`));
  }

  const results = await TMS.createPlan(req.body);
  if (!results) {
    return next(new ErrorHandler("Unable to create Plan", 404));
  }

  res.status(200).json({
    success: true,
    message: "Plan is created",
    data: `${results.affectedRows} row(s) is inserted`,
  });
});

exports.updatePlan = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  validationFn.deleteEmptyFields(req.body);

  let clauses = [];
  let values = [];
  for (const property in req.body) {
    if (property === "Plan_MVP_name") {
      res.status(400).json({
        success: false,
        meesage: "Not Allowed to change.",
      });
    }
    clauses.push(property + "=?");
    values.push(req.body[property]);
  }
  if (values) {
    values.push(req.params.planid);
  }
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(",");

  const results = await TMS.updatePlan(clauses, values);

  if (!results) {
    return next(new ErrorHandler("Unable to update plan", 404));
  }
  res.status(200).json({
    success: true,
    message: "Plan is updated",
    data: `${results.affectedRows} row(s) is updated`,
  });
});

// For Task
exports.getAllTasks = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  const tasks = await TMS.getAllTasks();
  if (!tasks || tasks.length === 0) {
    return next(new ErrorHandler("Unable to find any tasks", 404));
  }
  res.status(200).json({
    success: true,
    results: tasks.length,
    data: tasks,
  });
});
exports.getTask = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.appid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  const task = await TMS.getTask(req.params.taskid);
  if (!task || task.length === 0) {
    return next(new ErrorHandler("Unable to find task", 404));
  }

  res.status(200).json({
    success: true,
    message: "Here is the task details",
    data: task,
  });
});

exports.createTask = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }

  const appData = await TMS.getApp(req.params.appacronym);
  const appAcronym = appData[0].App_Acronym;
  const appRNumber = appData[0].App_Rnumber + 1;
  const taskid = appAcronym + "_" + appRNumber;

  //Format the date to yyyy-mm-dd
  const currentTimestamp = Date.now();
  const currentDate = new Date(currentTimestamp);
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  const formattedTimestamp = currentDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  validationFn.changeEmptyFieldsToNull(req.body);

  req.body.Task_createDate = formattedDate;
  req.body.Task_creator = req.username;
  req.body.Task_state = "open";
  req.body.Task_owner = req.username;
  req.body.Task_id = taskid;
  req.body.Task_plan = req.params.planid;
  req.body.Task_app_Acronym = req.params.appacronym;

  // Need to amend some logic here before sending into mysql statement****

  if (!req.body.Task_name || !req.body.Task_description === null) {
    return next(new ErrorHandler(`Something is required`));
  }

  req.body.Task_notes = req.body.Task_notes || [];
  if (req.body.Task_notes.length > 0) {
    const notesObj = {
      username: req.username,
      currentState: req.body.Task_state,
      date: req.body.Task_createDate,
      timestamp: formattedTimestamp,
      notes: req.body.message,
    };
    req.body.Task_notes.push(notesObj);
  }

  const results = await TMS.createTask(req.body);
  if (!results) {
    return next(new ErrorHandler("Task could not be created", 404));
  }
  const results2 = await TMS.updateAppFromTask(
    appRNumber,
    req.body.Task_app_Acronym
  );
  if (!results2) {
    return next(new ErrorHandler("App rnumber could not be updated", 404));
  }

  res.status(200).json({
    success: true,
    message: "Task is created",
    data: `${results.affectedRows} row(s) is inserted`,
    data2: `${results2.affectedRows} row(s) is inserted`,
  });
});

exports.updateTask = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  validationFn.deleteEmptyFields(req.body);

  let clauses = [];
  let values = [];
  for (const property in req.body) {
    if (property === "userid") {
      res.status(400).json({
        success: false,
        meesage: "Not Allowed to change.",
      });
    }
    clauses.push(property + "=?");
    values.push(req.body[property]);
  }
  if (values) {
    values.push(req.params.taskid);
  }
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(",");
  const results = await TMS.updateApp(clauses, values);

  if (!results) {
    return next(new ErrorHandler("Task could not be updated", 404));
  }
  res.status(200).json({
    success: true,
    message: "Task is updated",
    data: `${results.affectedRows} row(s) is updated`,
  });
});
