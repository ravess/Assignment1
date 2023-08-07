const catchAsyncError = require('../middlewares/catchAsyncError');
const validationFn = require('../utils/validation');
const TMS = require('../models/tmsModel');
const checkGroup = require('../utils/checkGroup');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');

// For App
exports.getAllApps = catchAsyncError(async (req, res, next) => {
  const apps = await TMS.getAllApps();

  if (!apps || apps.length === 0) {
    return next(new ErrorHandler('Unable to find any apps', 404));
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

// exports.getApp = catchAsyncError(async (req, res, next) => {
//   const app = await TMS.getApp(req.params.appacronym);
//   if (!app || app.length === 0) {
//     return next(new ErrorHandler('Unable to find app', 404));
//   }

//   const formattedApp = app.map((app) => {
//     return {
//       ...app,
//       App_startDate: validationFn.formatDate(app.App_startDate),
//       App_endDate: validationFn.formatDate(app.App_endDate),
//     };
//   });

//   console.log(formattedApp);

//   res.status(200).json({
//     success: true,
//     message: 'Here is the app details',
//     data: formattedApp,
//   });
// });

exports.getApp = catchAsyncError(async (req, res, next) => {
  const app = await TMS.getApp(req.params.appacronym);
  if (!app || app.length === 0) {
    return next(new ErrorHandler('Unable to find app', 404));
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
    return next(new ErrorHandler('Unable to find any plans', 404));
  }
  res.status(200).json({
    success: true,
    results: plans.length,
    data: plans,
  });
});

exports.getPlan = catchAsyncError(async (req, res, next) => {
  const plan = await TMS.getPlan(req.params.planid);
  if (!plan || plan.length === 0) {
    return next(new ErrorHandler('Unable to find plan', 404));
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
    return next(new ErrorHandler('Unable to find plan', 404));
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
    return next(new ErrorHandler('Unable to find any tasks', 404));
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
    return next(new ErrorHandler('Unable to find task', 404));
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
  const authorised = await checkGroup(req.username, req.body.usergroup);
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
  const [userGroupFromPermit] = await TMS.getAppPermit(req.params.appacronym);
  const searchValue = req.body.Task_state;
  let findUserGroup = null;

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

  let planIsDiff = false;
  const allowedTaskState = ['open', 'todolist', 'doing', 'done', 'closed'];
  const currentState = req.body.Task_state;
  const currentIndex = allowedTaskState.indexOf(req.body.Task_state);

  if (req.body.Task_newState === 'promote') {
    if (currentIndex !== -1 && currentIndex < allowedTaskState.length - 1) {
      req.body.Task_state = allowedTaskState[currentIndex + 1];
    } else {
      return next(new ErrorHandler('Unable to promote the task', 404));
    }
  } else if (req.body.Task_newState === 'demote') {
    if (currentIndex !== -1 && currentIndex > 0) {
      req.body.Task_state = allowedTaskState[currentIndex - 1];
    } else {
      return next(new ErrorHandler('Unable to demote the task', 404));
    }
  }

  //This is to tackle the plan if it is an empty string ********** roy need to revisit this logic
  if (req.body.Task_plan === '') {
    const [results] = await TMS.getTask(req.params.taskid);
    const { Task_plan } = results;
    if (Task_plan !== null && req.body.Task_plan === '') {
      console.log(`plan is different`);
      planIsDiff = true;
      req.body.Task_plan = null;
      const newMessage = req.username + ' has removed the plan from the task.';

      if (req.body.Task_notes !== '') {
        req.body.Task_notes += '\n' + newMessage;
      } else {
        req.body.Task_notes = newMessage;
      }
    }
  }
  if (req.body.Task_plan === '' && !planIsDiff && req.body.Task_notes === '') {
    return next(
      new ErrorHandler(`You are not updating any of the task details`, 404)
    );
  }

  // This is to check if task plan is Select A Plan and the plan is not different from the database when Select a Plan, this include notes to be empty string as well

  // This is to check if there is current plan, and if user has change to any other plans, e.g current is Sprint4, and he just click update without editing any of task details.
  if (req.body.Task_plan !== '' && req.body.Task_notes === '') {
    const [results] = await TMS.getTask(req.params.taskid);
    const { Task_plan } = results;
    if (req.body.Task_plan === Task_plan) {
      return next(
        new ErrorHandler(`You are not updating any of the task details`, 404)
      );
    }
  }

  const formattedDate = validationFn.formatDate();
  const formattedTimestamp = validationFn.formatTimeStamp();

  // To track any changes if the task plan did change from database. Associate Task plan/De-associate
  if (req.body.Task_plan) {
    const [results] = await TMS.getTask(req.params.taskid);
    const { Task_plan } = results;
    if (req.body.Task_plan === Task_plan) {
      delete req.body.Task_plan;
    } else if (req.body.Task_plan !== Task_plan) {
      // For Audit Trail formatting to append below task_notes if plan did updated
      const newMessage =
        (req.body.Task_notes || req.body.Task_newState ? '\n' : '') +
        ' ' +
        req.username +
        ' has updated the task to associate with Plan: ' +
        (req.body.Task_plan ? req.body.Task_plan : '');

      if (req.body.Task_notes) {
        req.body.Task_notes += newMessage;
      } else {
        req.body.Task_notes = newMessage;
      }
    }
  }

  // For Audit Trail formatting to append to task_notes if there is a state transition
  if (req.body.Task_newState === 'promote') {
    delete req.body.Task_newState;
    const newMessage =
      (req.body.Task_notes || req.body.Task_plan ? '\n' : '') +
      ' ' +
      req.username +
      ` has ${
        currentState === 'done' ? 'Approve' : 'promoted'
      } the task from ` +
      currentState +
      ' to ' +
      req.body.Task_state;
    if (req.body.Task_notes !== '') {
      req.body.Task_notes += newMessage;
    } else {
      req.body.Task_notes = '' + newMessage;
    }
  } else if (req.body.Task_newState === 'demote') {
    delete req.body.Task_newState;
    const newMessage =
      (req.body.Task_notes || req.body.Task_plan ? '\n' : '') +
      ' ' +
      req.username +
      ` has ${
        currentState === 'done' ? 'rejected' : 'demoted'
      } the task from ` +
      currentState +
      ' to ' +
      req.body.Task_state;
    if (req.body.Task_notes !== '') {
      req.body.Task_notes += newMessage;
    } else {
      req.body.Task_notes = '' + newMessage;
    }
  }

  // Setting the plan to null if it is an empty string
  // if (req.body.Task_plan === "") {
  //   req.body.Task_plan = null;
  //   const newMessage = req.username + " has removed the plan from the task.";

  //   if (req.body.Task_notes !== "") {
  //     req.body.Task_notes += "\n" + newMessage;
  //   } else {
  //     req.body.Task_notes = newMessage;
  //   }
  // }

  if (req.body.Task_notes !== '') {
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
      notes: req.body.Task_notes,
    };
    newTaskArr = JSON.parse(taskNoteArr[0].Task_notes);
    newTaskArr.push(notesObj);
    req.body.Task_notes = JSON.stringify(newTaskArr);
  }
  req.body.Task_owner = req.username;
  validationFn.changeEmptyFieldsToNull(req.body);
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
  const results = await TMS.updateTask(clauses, values);

  if (!results) {
    return next(new ErrorHandler('Task could not be updated', 404));
  }

  // For the email to trigger nodemailer after successfull promotion to done
  if (currentState === 'doing' && req.body.Task_state === 'done' && results) {
    // const message = `${req.username} has completed the task and require your approval/rejection to check.`;
    // const plEmail = await TMS.getPLEmail('pl');
    // try {
    //   await Promise.all()
    //   await sendEmail({
    //     email: plEmail.map((user) => user.useremail),
    //     subject: `${req.username} promoted the Task from ${currentState} to ${req.body.Task_state}`,
    //     message,
    //   });
    // } catch (error) {
    //   if (error) {
    //     return next(new ErrorHandler(`Email not able to fire out.`, 404));
    //   }
    // }
    const message = `${req.username} has completed the task and requires your approval/rejection to check.`;
    const plEmail = await TMS.getPLEmail('pl');

    try {
      // Send emails to multiple recipients asynchronously
      await Promise.all(
        plEmail.map(async (user) => {
          try {
            await sendEmail({
              email: user.useremail,
              subject: `${req.username} promoted the Task from ${currentState} to ${req.body.Task_state}`,
              message,
            });
          } catch (error) {
            // Handle errors for individual emails, if needed
            console.error(`Error sending email to ${user.useremail}:`, error);
          }
        })
      );
    } catch (error) {
      // Handle any errors that occurred during the sending process
      console.error('Error sending emails:', error);
      return next(new ErrorHandler(`Email not able to fire out.`, 404));
    }
  }
  res.status(200).json({
    success: true,
    message: 'Task is updated',
    data: `${results.affectedRows} row(s) is updated`,
  });
});
