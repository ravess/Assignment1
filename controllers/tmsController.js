const catchAsyncError = require('../middlewares/catchAsyncError');
const validationFn = require('../utils/validation');
const TMS = require('../models/tmsModel');
const checkGroup = require('../utils/checkGroup');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const nodemailer = require('nodemailer');

// For App
exports.getAllApps = catchAsyncError(async (req, res, next) => {
  const apps = await TMS.getAllApps();

  if (!apps || apps.length === 0) {
    return next(new ErrorHandler('Unable to find any apps', 405));
  }

  const formattedApps = apps.map((app) => {
    return {
      ...app,
      App_startDate: validationFn.formatDate(app.App_startDate),
      App_endDate: validationFn.formatDate(app.App_endDate),
    };
  });

  res.status(200).json({
    success: true,
    results: apps.length,
    data: formattedApps,
  });
});

exports.getApp = catchAsyncError(async (req, res, next) => {
  const app = await TMS.getApp(req.params.appacronym);
  if (!app || app.length === 0) {
    return next(new ErrorHandler('Unable to find app', 405));
  }

  const formattedApp = await Promise.all(
    app.map(async (app) => {
      const [App_permit_Open] = await checkGroup(
        req.username,
        app.App_permit_Open
      );
      const [App_permit_toDoList] = await checkGroup(
        req.username,
        app.App_permit_toDoList
      );
      const [App_permit_Doing] = await checkGroup(
        req.username,
        app.App_permit_Doing
      );
      const [App_permit_Done] = await checkGroup(
        req.username,
        app.App_permit_Done
      );
      const [App_permit_Create] = await checkGroup(
        req.username,
        app.App_permit_Create
      );
      const isApp_permit_Open = !!App_permit_Open.RESULT;
      const isApp_permit_toDoList = !!App_permit_toDoList.RESULT;
      const isApp_permit_Doing = !!App_permit_Doing.RESULT;
      const isApp_permit_Done = !!App_permit_Done.RESULT;
      const isApp_permit_Create = !!App_permit_Create.RESULT;

      return {
        ...app,
        App_startDate: validationFn.formatDate(app.App_startDate),
        App_endDate: validationFn.formatDate(app.App_endDate),
        App_permissions: {
          App_permit_Open: isApp_permit_Open,
          App_permit_toDoList: isApp_permit_toDoList,
          App_permit_Doing: isApp_permit_Doing,
          App_permit_Done: isApp_permit_Done,
          App_permit_Create: isApp_permit_Create,
        },
      };
    })
  );

  res.status(200).json({
    success: true,
    message: 'Here is the app details',
    data: formattedApp,
  });
});

//Only Pl can createApp
exports.createApp = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.username, req.body.usergroup);
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler('You are not authorised to access this resource', 401)
    );
  }
  delete req.body.usergroup;
  const errMessages = [];

  validationFn.changeEmptyFieldsToNull(req.body);
  // validationFn.concatPermitWith(req.body);
  validationFn.removewhitespaces(req.body);
  // Need to amend some logic here before sending into mysql statement****

  if (!req.body.App_Acronym) {
    errMessages.push('App Acronym is required');
  }
  if (!req.body.App_Description) {
    errMessages.push('App Description is required');
  }
  if (req.body.App_Rnumber === null) {
    errMessages.push('App R Number is required');
  } else if (req.body.App_Rnumber <= 0) {
    errMessages.push('App R Number cannot be 0 or negative');
  }
  if (errMessages.length > 0) {
    return next(new ErrorHandler(errMessages.join(', '), 404));
  }

  const results = await TMS.createApp(req.body);
  if (!results) {
    return next(new ErrorHandler('Unable to create App', 404));
  }

  res.status(200).json({
    success: true,
    message: 'App is created',
    data: `${results.affectedRows} row(s) is inserted`,
  });
});

// Only PL can update App
exports.updateApp = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.username, req.body.usergroup);
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler('You are not authorised to access this resource', 401)
    );
  }
  delete req.body.usergroup;

  const app = await TMS.getApp(req.params.appacronym);
  const formattedApp = app.map((app) => {
    return {
      ...app,
      App_startDate: validationFn.formatDate(app.App_startDate),
      App_endDate: validationFn.formatDate(app.App_endDate),
    };
  });

  for (const property in req.body) {
    if (req.body[property] === formattedApp[0][property]) {
      delete req.body[property]; // Delete the property if it's the same
    }
  }
  if (Object.keys(req.body).length === 0) {
    return next(new ErrorHandler(`You are not updating any details`, 404));
  }

  validationFn.changeEmptyFieldsToNull(req.body);

  let clauses = [];
  let values = [];
  for (const property in req.body) {
    if (property === 'App_Acronym') {
      res.status(400).json({
        success: false,
        meesage: 'Not Allowed to change.',
      });
    }
    clauses.push(property + '=?');
    values.push(req.body[property]);
  }
  if (values) {
    values.push(req.params.appacronym);
  }
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(',');
  const results = await TMS.updateApp(clauses, values);

  if (!results) {
    return next(new ErrorHandler('Unable to update App', 404));
  }
  res.status(200).json({
    success: true,
    message: 'App is updated',
    data: `${results.affectedRows} row(s) is updated`,
  });
});

exports.getAllPlans = catchAsyncError(async (req, res, next) => {
  const plans = await TMS.getAllPlans(req.params.appacronym);
  if (!plans || plans.length === 0) {
    return next(new ErrorHandler('Unable to find any plans', 405));
  }

  const formattedPlan = plans.map((planItem) => ({
    ...planItem,
    Plan_startDate: validationFn.formatDate(planItem.Plan_startDate),
    Plan_endDate: validationFn.formatDate(planItem.Plan_endDate),
  }));

  res.status(200).json({
    success: true,
    results: plans.length,
    data: formattedPlan,
  });
});

exports.getPlan = catchAsyncError(async (req, res, next) => {
  const plan = await TMS.getPlan(req.params.planid);
  if (!plan || plan.length === 0) {
    return next(new ErrorHandler('Unable to find plan', 405));
  }
  const formattedPlan = plan.map((planItem) => ({
    ...planItem,
    Plan_startDate: validationFn.formatDate(planItem.Plan_startDate),
    Plan_endDate: validationFn.formatDate(planItem.Plan_endDate),
  }));

  res.status(200).json({
    success: true,
    message: 'Here is the plan details',
    data: formattedPlan,
  });
});

exports.getPlanColor = catchAsyncError(async (req, res, next) => {
  const plansColor = await TMS.getPlanColor(req.params.planid);
  if (!plansColor || plansColor.length === 0) {
    return next(new ErrorHandler('Unable to find plan', 405));
  }

  res.status(200).json({
    success: true,
    message: 'Here is the planColors details',
    data: plansColor,
  });
});

exports.createPlan = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.username, req.body.usergroup);
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler('You are not authorised to access this resource', 401)
    );
  }
  delete req.body.usergroup;

  validationFn.changeEmptyFieldsToNull(req.body);
  req.body.Plan_app_Acronym = req.params.appacronym;

  // Backend validation that plan cannot be empty string before sending into
  if (req.body.Plan_MVP_name === null) {
    return next(new ErrorHandler(`Name is required`, 404));
  }
  if (req.body.Plan_startDate > req.body.Plan_endDate) {
    return next(
      new ErrorHandler(`Start Date cannot be later than End Date`, 404)
    );
  }

  const results = await TMS.createPlan(req.body);
  if (!results) {
    return next(new ErrorHandler('Unable to create Plan', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Plan is created',
    data: `${results.affectedRows} row(s) is inserted`,
  });
});

exports.updatePlan = catchAsyncError(async (req, res, next) => {
  const authorised = await checkGroup(req.username, req.body.usergroup);
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler('You are not authorised to access this resource', 401)
    );
  }
  delete req.body.usergroup;

  const plan = await TMS.getPlan(req.params.planid);
  if (!plan || plan.length === 0) {
    return next(new ErrorHandler('Unable to find plan', 405));
  }
  const formattedPlan = plan.map((planItem) => ({
    ...planItem,
    Plan_startDate: validationFn
      .formatDate(planItem.Plan_startDate)
      .slice(0, 10),
    Plan_endDate: validationFn.formatDate(planItem.Plan_endDate).slice(0, 10),
  }));

  for (const property in req.body) {
    if (req.body[property] === formattedPlan[0][property]) {
      delete req.body[property]; // Delete the property if it's the same
    }
  }
  if (Object.keys(req.body).length === 0) {
    return next(new ErrorHandler(`You are not updating any details`, 404));
  }

  let clauses = [];
  let values = [];
  for (const property in req.body) {
    if (property === 'Plan_MVP_name') {
      res.status(400).json({
        success: false,
        meesage: 'Not Allowed to change.',
      });
    }
    clauses.push(property + '=?');
    values.push(req.body[property]);
  }
  if (values) {
    values.push(req.params.planid);
  }
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(',');

  const results = await TMS.updatePlan(clauses, values);

  if (!results) {
    return next(new ErrorHandler('Unable to update plan', 404));
  }
  res.status(200).json({
    success: true,
    message: 'Plan is updated',
    data: `${results.affectedRows} row(s) is updated`,
  });
});

// For Task
exports.getAllTasks = catchAsyncError(async (req, res, next) => {
  const [userGroupFromPermit] = await TMS.getAppPermit(req.params.appacronym);
  const [App_permit_Open] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_Open
  );
  const [App_permit_toDoList] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_toDoList
  );
  const [App_permit_Doing] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_Doing
  );
  const [App_permit_Done] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_Done
  );
  const [App_permit_Create] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_Create
  );

  const isApp_permit_Open = !!App_permit_Open.RESULT;
  const isApp_permit_toDoList = !!App_permit_toDoList.RESULT;
  const isApp_permit_Doing = !!App_permit_Doing.RESULT;
  const isApp_permit_Done = !!App_permit_Done.RESULT;
  const isApp_permit_Create = !!App_permit_Create.RESULT;

  const tasks = await TMS.getAllTasks(req.params.appacronym);
  if (!tasks || tasks.length === 0) {
    return next(new ErrorHandler('Unable to find any tasks', 405));
  }
  const formattedTasks = tasks.map((task) => {
    const localTime = task.Task_createDate
      ? task.Task_createDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : '';
    return {
      ...task,
      Task_notes: JSON.parse(task.Task_notes),
      Task_createDate: task.Task_createDate
        ? task.Task_createDate.toISOString().slice(0, 10)
        : '',
      Task_timestamp: localTime,
      Task_plan: task.Task_plan ? task.Task_plan : '',
      App_permissions: {
        App_permit_Open: isApp_permit_Open,
        App_permit_toDoList: isApp_permit_toDoList,
        App_permit_Doing: isApp_permit_Doing,
        App_permit_Done: isApp_permit_Done,
        App_permit_Create: isApp_permit_Create,
      },
    };
  });

  res.status(200).json({
    success: true,
    results: formattedTasks.length,
    data: formattedTasks,
  });
});
exports.getTask = catchAsyncError(async (req, res, next) => {
  const [userGroupFromPermit] = await TMS.getAppPermit(req.params.appacronym);
  const [App_permit_Open] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_Open
  );
  const [App_permit_toDoList] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_toDoList
  );
  const [App_permit_Doing] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_Doing
  );
  const [App_permit_Done] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_Done
  );
  const [App_permit_Create] = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_Create
  );
  const isApp_permit_Open = !!App_permit_Open.RESULT;
  const isApp_permit_toDoList = !!App_permit_toDoList.RESULT;
  const isApp_permit_Doing = !!App_permit_Doing.RESULT;
  const isApp_permit_Done = !!App_permit_Done.RESULT;
  const isApp_permit_Create = !!App_permit_Create.RESULT;

  const task = await TMS.getTask(req.params.taskid);
  if (!task || task.length === 0) {
    return next(new ErrorHandler('Unable to find task', 405));
  }
  const formattedTask = task.map((task) => {
    const localTime = task.Task_createDate
      ? task.Task_createDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : '';
    return {
      ...task,
      Task_notes: JSON.parse(task.Task_notes),
      Task_createDate: task.Task_createDate
        ? task.Task_createDate.toISOString().slice(0, 10)
        : '',
      Task_timestamp: localTime,
      Task_plan: task.Task_plan ? task.Task_plan : '',
      App_permissions: {
        App_permit_Open: isApp_permit_Open,
        App_permit_toDoList: isApp_permit_toDoList,
        App_permit_Doing: isApp_permit_Doing,
        App_permit_Done: isApp_permit_Done,
        App_permit_Create: isApp_permit_Create,
      },
    };
  });

  res.status(200).json({
    success: true,
    message: 'Here is the task details',
    data: formattedTask,
  });
});

exports.createTask = catchAsyncError(async (req, res, next) => {
  const [userGroupFromPermit] = await TMS.getAppPermit(req.params.appacronym);
  const authorised = await checkGroup(
    req.username,
    userGroupFromPermit.App_permit_Create
  );
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler('You are not authorised to access this resource', 401)
    );
  }
  delete req.body.usergroup;
  const appData = await TMS.getApp(req.params.appacronym);
  const appAcronym = appData[0].App_Acronym;
  const appRNumber = appData[0].App_Rnumber + 1;
  const taskid = appAcronym + '_' + appRNumber;

  //Format the date to yyyy-mm-dd
  const formattedDate = validationFn.formatDate();
  const formattedTimestamp = validationFn.formatTimeStamp();

  //Might need to remove for the task plan if there is a body
  validationFn.changeEmptyFieldsToNull(req.body);

  //System autogenerate for task creation.
  req.body.Task_createDate = formattedDate;
  req.body.Task_creator = req.username;
  req.body.Task_state = 'open';
  req.body.Task_owner = req.username;
  req.body.Task_id = taskid;
  req.body.Task_app_Acronym = req.params.appacronym;

  if (!req.body.Task_name || !req.body.Task_description === null) {
    return next(
      new ErrorHandler(`Pleas ensure you input the name and description in it`)
    );
  }

  // THe below code snippet is when the task notes is an empty string, it will set it to be an array which than follows to store in the database. Either way it will convert the req.body[Task_notes] into an array of objects.
  req.body.Task_notes = req.body.Task_notes || [];
  if (req.body.Task_notes.length > 0 || Array.isArray(req.body.Task_notes)) {
    const notesArr = [];
    const notesObj = {
      username: req.username,
      currentState: req.body.Task_state,
      date: req.body.Task_createDate,
      timestamp: formattedTimestamp,
      notes: req.body.Task_notes,
    };
    notesArr.push(notesObj);
    req.body.Task_notes = notesArr;
  }
  req.body.Task_notes = JSON.stringify(req.body.Task_notes);

  const results = await TMS.createTask(req.body);
  if (!results) {
    return next(new ErrorHandler('Task could not be created', 404));
  }
  const results2 = await TMS.updateAppFromTask(
    appRNumber,
    req.body.Task_app_Acronym
  );
  if (!results2) {
    return next(new ErrorHandler('App rnumber could not be updated', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Task is created',
    data: `${results.affectedRows} row(s) is inserted`,
    data2: `${results2.affectedRows} row(s) is inserted`,
  });
});

exports.updateTask = catchAsyncError(async (req, res, next) => {
  validationFn.changeEmptyFieldsToNull(req.body);
  const [userGroupFromPermit] = await TMS.getAppPermit(req.params.appacronym);
  const [results] = await TMS.getTask(req.params.taskid);
  const { Task_plan } = results;
  const [dbCurrentState] = await TMS.getTask(req.params.taskid);
  const searchValue = req.body.Task_state;
  const allowedTaskState = ['open', 'todolist', 'doing', 'done', 'closed'];
  const currentState = req.body.Task_state;
  const currentPlan = req.body.Task_plan;
  let currentNotes = req.body.Task_notes;
  const currentIndex = allowedTaskState.indexOf(req.body.Task_state);
  const promotedState = allowedTaskState[currentIndex + 1];
  const demotedState = allowedTaskState[currentIndex - 1];
  const formattedDate = validationFn.formatDate();
  const formattedTimestamp = validationFn.formatTimeStamp();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  let findUserGroup = null;
  let planIsDiff = false;
  let newMessage = [];
  //This is to checkgroup based on the permit allowed to update task while looping.
  Object.keys(userGroupFromPermit).forEach((key) => {
    if (key.split('_')[2].toLowerCase() === searchValue) {
      findUserGroup = userGroupFromPermit[key];
    }
  });
  req.body.usergroup = findUserGroup;
  const authorised = await checkGroup(req.username, req.body.usergroup);
  if (!authorised[0].RESULT) {
    return next(
      new ErrorHandler('You are not authorised to access this resource', 401)
    );
  }
  delete req.body.usergroup;

  //This is to check if the current State if user is updating the Task which is at o
  if (currentState !== dbCurrentState.Task_state) {
    return next(
      new ErrorHandler('You are not updating the current state', 404)
    );
  }

  // This is for all the messages to be displayed based on the audit trail
  if (currentNotes !== null) {
    newMessage.push(currentNotes);
  }
  if (currentPlan !== null) {
    if (currentPlan !== Task_plan) {
      newMessage.push(
        `${req.username} has updated the task to associate with plan ${currentPlan}`
      );
    }
  }
  if (currentPlan === null) {
    if (Task_plan !== currentPlan) {
      planIsDiff = true;
      newMessage.push(`${req.username} has removed the plan from the task.`);
    }
  }
  if (req.body.Task_newState === 'promote') {
    newMessage.push(
      `${req.username} has ${
        currentState === 'done' ? 'approved' : 'promoted'
      } the task from ${currentState} to ${promotedState}`
    );
  }

  if (req.body.Task_newState === 'demote') {
    newMessage.push(
      `${req.username} has ${
        currentState === 'done' ? 'rejected' : 'demoted'
      } the task from ${currentState} to ${demotedState}`
    );
  }
  if (newMessage.length > 0) {
    newMessage = newMessage.join('\n ');
  }

  // All the conditions to check if there is
  if (
    currentPlan === null &&
    !planIsDiff &&
    currentNotes === null &&
    !req.body.Task_newState
  ) {
    return next(
      new ErrorHandler(`You are not updating any of the task details`, 404)
    );
  }

  if (
    currentPlan !== null &&
    (currentNotes === null || currentNotes !== null)
  ) {
    if (
      currentPlan === Task_plan &&
      !req.body.Task_newState &&
      currentNotes === null
    ) {
      return next(
        new ErrorHandler(`You are not updating any of the task details`, 404)
      );
    } else if (
      currentPlan !== Task_plan &&
      req.body.Task_newState === 'promote' &&
      currentState === 'done'
    ) {
      return next(
        new ErrorHandler(
          'You are not allowed to promote with a plan changed.',
          404
        )
      );
    } else if (
      currentPlan !== Task_plan &&
      !req.body.Task_newState &&
      currentState === 'done'
    ) {
      return next(
        new ErrorHandler(
          'You are only allowed to reject and update plan in done state'
        )
      );
    }
  } else if (
    currentPlan === null &&
    (currentNotes === null || currentNotes !== null)
  )
    if (
      currentPlan !== Task_plan &&
      !req.body.Task_newState &&
      currentState === 'done'
    ) {
      return next(
        new ErrorHandler(
          'You are only allowed to reject and update plan in done state'
        )
      );
    }

  if (
    currentPlan !== Task_plan &&
    req.body.Task_newState === 'promote' &&
    currentState === 'done'
  ) {
    return next(
      new ErrorHandler('You are not allowed to update the currentplan')
    );
  }

  if (req.body.Task_newState === 'promote') {
    req.body.Task_state = promotedState;
  } else if (req.body.Task_newState === 'demote') {
    req.body.Task_state = demotedState;
  }
  // When the task notes is not empty from the frontend, it retrieve current task notes
  // if (currentNotes !== "") {
  currentNotes = currentNotes || [];
  if (currentNotes.length > 0 || Array.isArray(currentNotes)) {
    const taskNoteArr = await TMS.getTaskNotes(req.params.taskid);
    if (!taskNoteArr) {
      return next(new ErrorHandler('Unable to retrieve any task notes', 404));
    }
    let newTaskArr = [];
    const notesObj = {
      username: req.username,
      currentState: currentState,
      date: formattedDate,
      timestamp: formattedTimestamp,
      notes: newMessage,
    };
    newTaskArr = JSON.parse(taskNoteArr[0].Task_notes);
    newTaskArr.push(notesObj);
    req.body.Task_notes = JSON.stringify(newTaskArr);
  }

  // }

  req.body.Task_owner = req.username;
  // validationFn.changeEmptyFieldsToNull(req.body);
  delete req.body.Task_newState;

  // Data has been sanitized and retrieve accordingly before inserting to database.
  let clauses = [];
  let values = [];
  for (const property in req.body) {
    if (
      property === 'Task_name' ||
      property === 'Task_description' ||
      property === 'Task_id'
    ) {
      res.status(400).json({
        success: false,
        meesage: 'Not Allowed to change.',
      });
    }
    clauses.push(property + '=?');
    values.push(req.body[property]);
  }
  if (values) {
    values.push(req.params.taskid);
  }
  // The above code is to allow me to dynamicly accept any json values
  clauses = clauses.join(',');
  const results2 = await TMS.updateTask(clauses, values);

  if (!results2) {
    return next(new ErrorHandler('Task could not be updated', 404));
  }

  // For the email to trigger nodemailer after successfull promotion to done

  if (currentState === 'doing' && req.body.Task_state === 'done' && results2) {
    const message = `${req.username} has completed the \n\nTask Name: ${results.Task_name}\nFrom ${currentState}\nPromoted to ${req.body.Task_state}\n\nwhich requires your approval/rejection to check.`;
    const plEmail = await TMS.getPLEmail('pl');

    // Send emails to multiple recipients asynchronously
    const emailPromises = plEmail.map(async (user) => {
      try {
        await sendEmail({
          email: user.useremail,
          subject: `${req.username} promoted the Task Name: ${results.Task_name} from ${currentState} to ${req.body.Task_state}`,
          message,
        });
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        // Handle errors for individual emails, if needed
        console.error(`Error sending email to ${user.useremail}:`, error);
      }
    });

    // Continue immediately with sending the response
    res.status(200).json({
      success: true,
      message: 'Task is updated',
      data: `${results.affectedRows} row(s) is updated`,
    });

    // After a small delay, wait for all email promises to complete

    await Promise.all(emailPromises);
    transporter.close();
  } else {
    // Send the response when no email needs to be sent
    res.status(200).json({
      success: true,
      message: 'Task is updated',
      data: `${results.affectedRows} row(s) is updated`,
    });
  }
});
