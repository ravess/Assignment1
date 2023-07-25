const catchAsyncError = require("../middlewares/catchAsyncError");
const validationFn = require("../utils/validation");
const TMS = require("../models/tmsModel");

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
  res.status(200).json({
    success: true,
    results: apps.length,
    data: apps,
  });
});

exports.getApp = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  const app = await TMS.getApp(req.params.appid);
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
  validationFn.deleteEmptyFields(req.body);
  // Need to amend some logic here before sending into mysql statement****
  const {
    app_acronym,
    app_description,
    app_rNumber,
    app_startDate,
    app_endDate,
    app_permit_open,
    app_permite_toDolist,
    app_permit_Doing,
    app_permit_done,
  } = req.body;

  if (!app_acronym || !app_description || !app_rNumber === null) {
    return next(
      new ErrorHandler(`appacronym, appdescription and apprNumber is required`)
    );
  }

  const results = await TMS.createApp(
    app_acronym,
    app_description,
    app_rNumber,
    app_startDate,
    app_endDate,
    app_permit_open,
    app_permite_toDolist,
    app_permit_Doing,
    app_permit_done
  );
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
    values.push(req.params.appid);
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
exports.getAllPlans = catchAsyncError(async (req, rest, next) => {
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
    results: apps.length,
    data: apps,
  });
});

exports.getPlan = catchAsyncError(async (req, rest, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  const plan = await TMS.getApp(req.params.appid);
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
  validationFn.deleteEmptyFields(req.body);
  // Need to amend some logic here before sending into mysql statement****
  const { plan_mvp_name, plan_startDate, plan_endDate, plan_app_acronym } =
    req.body;

  if (!plan_mvp_name || !plan_app_acronym === null) {
    return next(new ErrorHandler(`Something is required`));
  }

  const results = await TMS.createPlan(
    plan_mvp_name,
    plan_startDate,
    plan_endDate,
    plan_app_acronym
  );
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
    values.push(req.params.userid);
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
exports.getAllTasks = catchAsyncError(async (req, rest, next) => {
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
    results: apps.length,
    data: apps,
  });
});
exports.getTask = catchAsyncError(async (req, rest, next) => {
  const authorised = await checkGroup(req.appid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  const task = await TMS.getTask(req.params.appid);
  if (!task || task.length === 0) {
    return next(new ErrorHandler("Unable to find task", 404));
  }

  res.status(200).json({
    success: true,
    message: "Here is the app details",
    data: app,
  });
});

exports.createTask = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.userid, "admin");
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler("You are not authorised to access this resource", 403)
    );
  }
  validationFn.deleteEmptyFields(req.body);
  validationFn.validatePassword(req.body.userpassword);
  // Need to amend some logic here before sending into mysql statement****
  const { username, useremail, userpassword, usergroup, userisActive } =
    req.body;

  if (!username || !userpassword || userisActive === null) {
    return next(new ErrorHandler(`Something is required`));
  }

  const results = await TMS.createApp(
    username,
    hashedpassword,
    useremail,
    usergroup,
    userisActive
  );
  if (!results) {
    return next(new ErrorHandler("App not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "App is created",
    data: `${results.affectedRows} row(s) is inserted`,
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
    values.push(req.params.userid);
  }
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(",");
  const results = await TMS.updateApp(clauses, values);

  if (!results) {
    return next(new ErrorHandler("App not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "App is updated",
    data: `${results.affectedRows} row(s) is updated`,
  });
});
