const a3 = require("../models/a3Model");
const bcrypt = require("bcryptjs");
const checkGroup = require("../utils/checkGroup");
const sendEmail = require("../utils/sendEmail");
const validationFn = require("../utils/validation");

exports.createTask = async (req, res, next) => {
  const errInvalidDataType = [];
  try {
    //Check for Invalid URL
    if (req.originalUrl !== "/createTask") {
      return res.status(500).json({
        code: "E01",
        // message: "Invalid URL or contains queries.",
      });
    }

    //Check for Extra Fields
    const extraFields = [
      "username",
      "password",
      "Task_app_Acronym",
      "Task_notes",
      "Task_plan",
      "Task_description",
      "Task_name",
    ];

    //Saving the object keys to a array for check of extra fields not to be inside
    const reqBodyKeys = Object.keys(req.body);
    const additionalFieldsPresent = [];
    reqBodyKeys.forEach((field) => {
      if (!extraFields.includes(field)) {
        additionalFieldsPresent.push(field);
      }
    });
    if (additionalFieldsPresent.length > 0) {
      additionalFieldsPresent.push(`received.`);
      const errMessage = additionalFieldsPresent.join(", ");
      return res.status(500).json({
        code: "E02",
        // message: `Invalid JSON - extra JSON parameters, ${errMessage}`,
      });
    }

    //Check For Invalid DataTypes
    for (const property in req.body) {
      if (typeof req.body[property] !== "string") {
        errInvalidDataType.push(property);
      }
    }
    if (errInvalidDataType.length > 0) {
      errInvalidDataType.push(`needs to be type [String]`);
      const errMessage = errInvalidDataType.join(", ");
      return res.status(500).json({
        code: "E03",
        // meesage: `Invalid DataType, ${errMessage}`,
      });
    }

    //Check for mandatory fields
    const mandatoryFields = [
      "username",
      "password",
      "Task_app_Acronym",
      "Task_description",
      "Task_name",
    ];

    const notPresentInMandatoryFields = [];
    mandatoryFields.forEach((field) => {
      if (!reqBodyKeys.includes(field)) {
        notPresentInMandatoryFields.push(`${field}`);
      } else if (req.body[field].trim() === "") {
        notPresentInMandatoryFields.push(`${field}`);
      }
    });
    if (notPresentInMandatoryFields.length > 0) {
      notPresentInMandatoryFields.push(`must not be empty.`);
      const errMessage = notPresentInMandatoryFields.join(", ");
      return res.status(500).json({
        code: "E04",
        // message: `Invalid JSON - ${errMessage}`,
      });
    }

    // Check if invalid Login Details
    const user = await a3.loginUser(req.body.username.trim());

    if (!user[0] || req.body.username.trim() !== user[0].username) {
      return res.status(500).json({
        code: "E05",
        // message: "Invalid username or password",
      });
    }
    // Check if password is correct if not also return Invalid Email or Password
    const hashedPasswordFromDB = user[0].userpassword;
    const isPasswordMatched = await bcrypt.compare(
      req.body.password,
      hashedPasswordFromDB
    );
    if (!isPasswordMatched) {
      return res.status(500).json({
        code: "E05",
        // message: "Invalid username or password",
      });
    }
    // Check if user is disabled
    if (!user[0].userisActive) {
      return res.status(500).json({
        code: "E06",
        // message: "User account is inactive",
      });
    }

    req.username = user[0].username;
    delete req.body.username;
    delete req.body.password;

    // Trim the relevant req.body properties
    for (const property in req.body) {
      if (req.body[property] !== "") {
        req.body[property] = req.body[property].trim();
      }
    }

    const [userGroupFromPermit] = await a3.getAppPermit(
      req.body.Task_app_Acronym
    );
    if (!userGroupFromPermit) {
      return res.status(500).json({
        code: "E07",
        // message: "Application acronym is invalid",
      });
    }

    const authorised = await checkGroup(
      req.username,
      userGroupFromPermit.App_permit_Create
    );
    if (!authorised[0].RESULT) {
      return res.status(500).json({
        code: "E08",
        // message: "Invalid Permit"
      });
    }

    // Check for Invalid Task_plan which does not exist
    if (!reqBodyKeys.includes("Task_plan")) {
      req.body.Task_plan = null;
    }

    if (req.body.Task_plan !== "" && req.body.Task_plan !== null) {
      const checkPlan = await a3.getAllPlans(req.body.Task_app_Acronym);
      const [isPlanFound] = checkPlan.filter((planObj) => {
        return planObj.Plan_MVP_name === req.body.Task_plan;
      });

      if (!isPlanFound) {
        return res.status(500).json({
          code: "E10",
          // message: "Task plan does not exist",
        });
      }
    }

    const [appData] = await a3.getApp(req.body.Task_app_Acronym);
    const appAcronym = appData.App_Acronym;
    const appRNumber = appData.App_Rnumber + 1;
    const taskid = appAcronym + "_" + appRNumber;

    //Format the date to yyyy-mm-dd
    const formattedDate = validationFn.formatDate();
    const formattedTimestamp = validationFn.formatTimeStamp();
    let newMessage = [];

    //Might need to remove for the task plan if there is a body
    validationFn.changeEmptyFieldsToNull(req.body);

    req.body.Task_createDate = formattedDate;
    req.body.Task_creator = req.username;
    req.body.Task_state = "open";
    req.body.Task_owner = req.username;
    req.body.Task_id = taskid;

    if (req.body.Task_notes !== null) {
      newMessage.push(
        `${req.body.Task_notes}\n ${req.username} has created a task`
      );
    }

    if (req.body.Task_notes === null) {
      newMessage.push(`${req.username} has created a Task`);
    }

    if (newMessage.length > 0) {
      newMessage = newMessage.join("\n ");
    }

    req.body.Task_notes = req.body.Task_notes || [];

    if (req.body.Task_notes.length > 0 || Array.isArray(req.body.Task_notes)) {
      const notesArr = [];
      const notesObj = {
        username: req.username,
        currentState: req.body.Task_state,
        date: req.body.Task_createDate,
        timestamp: formattedTimestamp,
        notes: newMessage,
      };
      notesArr.push(notesObj);
      req.body.Task_notes = notesArr;
    }
    req.body.Task_notes = JSON.stringify(req.body.Task_notes);
    console.log(req.body);

    const results = await a3.createTask(req.body);
    if (!results) {
      return res.status(500).json({
        code: "E14",
        // message: "Internal Server Error.",
      });
    }
    const results2 = await a3.updateAppFromTask(
      appRNumber,
      req.body.Task_app_Acronym
    );
    if (!results2) {
      return res.status(500).json({
        code: "E14",
        // message: "Internal Server Error.",
      });
    }

    //Temp fix for taskid shown
    let task_id = "";
    if (results2) {
      task_id = `${req.body.Task_app_Acronym}_${appRNumber}`;
    }

    res.status(200).json({
      code: "S01",
      Task_id: task_id,
    });
  } catch (error) {
    if (error.code === "ER_DATA_TOO_LONG") {
      return res.status(500).json({
        code: "E13",
        // message: "JSON Parameter exceeds size limit.",
      });
    } else {
      return res.status(500).json({
        code: "E14",
        // message: "Internal Server Error.",
      });
    }
  }
};

exports.getTaskByState = async (req, res, next) => {
  const errInvalidDataType = [];
  try {
    //Check for Invalid URL
    if (req.originalUrl !== "/getTaskByState") {
      return res.status(500).json({
        code: "E01",
        // message: "Invalid URL or contains queries.",
      });
    }

    //Check for Extra Fields
    const extraFields = [
      "username",
      "password",
      "Task_app_Acronym",
      "Task_state",
    ];
    const reqBodyKeys = Object.keys(req.body);
    const additionalFieldsPresent = [];
    reqBodyKeys.forEach((field) => {
      if (!extraFields.includes(field)) {
        additionalFieldsPresent.push(field);
      }
    });
    if (additionalFieldsPresent.length > 0) {
      additionalFieldsPresent.push(`received.`);
      const errMessage = additionalFieldsPresent.join(", ");
      return res.status(500).json({
        code: "E02",
        // message: `Invalid JSON - extra JSON parameters, ${errMessage}`,
      });
    }

    //Check For Invalid DataTypes
    for (const property in req.body) {
      if (typeof req.body[property] !== "string") {
        errInvalidDataType.push(property);
      }
    }
    if (errInvalidDataType.length > 0) {
      errInvalidDataType.push(`needs to be type [String]`);
      const errMessage = errInvalidDataType.join(", ");
      return res.status(500).json({
        code: "E03",
        // meesage: `Invalid DataType, ${errMessage}`,
      });
    }

    //Check for mandatory fields
    const mandatoryFields = [
      "username",
      "password",
      "Task_app_Acronym",
      "Task_state",
    ];

    const notPresentInMandatoryFields = [];
    mandatoryFields.forEach((field) => {
      if (!reqBodyKeys.includes(field)) {
        notPresentInMandatoryFields.push(`${field}`);
      } else if (req.body[field].trim() === "") {
        notPresentInMandatoryFields.push(`${field}`);
      }
    });
    if (notPresentInMandatoryFields.length > 0) {
      notPresentInMandatoryFields.push(`must not be empty.`);
      const errMessage = notPresentInMandatoryFields.join(", ");
      return res.status(500).json({
        code: "E04",
        // message: `Invalid JSON - ${errMessage}`,
      });
    }

    // Check if invalid Login Details
    const user = await a3.loginUser(req.body.username.trim());

    if (!user[0] || req.body.username.trim() !== user[0].username) {
      return res.status(500).json({
        code: "E05",
        // message: "Invalid username or password",
      });
    }
    // Check if password is correct if not also return Invalid Email or Password
    const hashedPasswordFromDB = user[0].userpassword;
    const isPasswordMatched = await bcrypt.compare(
      req.body.password,
      hashedPasswordFromDB
    );
    if (!isPasswordMatched) {
      return res.status(500).json({
        code: "E05",
        // message: "Invalid username or password",
      });
    }
    // Check if user is disabled
    if (!user[0].userisActive) {
      return res.status(500).json({
        code: "E06",
        // message: "User account is inactive",
      });
    }

    req.username = user[0].username;
    delete req.body.username;
    delete req.body.password;

    // Trim the relevant req.body properties
    for (const property in req.body) {
      if (req.body[property] !== "") {
        req.body[property] = req.body[property].trim();
      }
    }

    // Check for Valid Task App Acronym
    const [userGroupFromPermit] = await a3.getAppPermit(
      req.body.Task_app_Acronym
    );
    if (!userGroupFromPermit) {
      return res.status(500).json({
        code: "E07",
        // message: "Application acronym is invalid",
      });
    }

    const allowedStates = ["Open", "toDoList", "Doing", "Done", "Closed"];

    if (!allowedStates.includes(req.body.Task_state.trim())) {
      return res.status(500).json({
        code: "E12",
        // message: "State does not exist.",
      });
    }

    const tasks = await a3.getAllTasksByState(
      req.body.Task_app_Acronym,
      req.body.Task_state
    );
    if (!tasks || tasks.length === 0) {
      return res.status(200).json({
        code: "S01",
        Task: [],
      });
    }
    const formattedTasks = tasks.map((task) => {
      const localTime = task.Task_createDate
        ? task.Task_createDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "";
      return {
        ...task,
        Task_notes: JSON.parse(task.Task_notes),
        Task_createDate: task.Task_createDate
          ? task.Task_createDate.toISOString().slice(0, 10)
          : "",
        Task_timestamp: localTime,
        Task_plan: task.Task_plan ? task.Task_plan : "",
      };
    });

    res.status(200).json({
      code: "S01",
      Task: formattedTasks,
    });
  } catch (error) {
    if (error.code === "ER_DATA_TOO_LONG") {
      return res.status(500).json({
        code: "E13",
        // message: "DATA TOO LONG",
      });
    } else {
      return res.status(500).json({
        code: "E14",
        // message: "Internal Server Error.",
      });
    }
  }
};

exports.promoteTask2Done = async (req, res, next) => {
  const errInvalidDataType = [];
  try {
    //Check for Invalid URL
    if (req.originalUrl !== "/promoteTask2Done") {
      return res.status(500).json({
        code: "E01",
        // message: "Invalid URL or contains queries.",
      });
    }

    //Check for Extra Fields
    const extraFields = ["username", "password", "Task_id", "Task_notes"];
    const reqBodyKeys = Object.keys(req.body);
    const additionalFieldsPresent = [];
    reqBodyKeys.forEach((field) => {
      if (!extraFields.includes(field)) {
        additionalFieldsPresent.push(field);
      }
    });
    if (additionalFieldsPresent.length > 0) {
      additionalFieldsPresent.push(`received.`);
      const errMessage = additionalFieldsPresent.join(", ");
      return res.status(500).json({
        code: "E02",
        // message: `Invalid JSON - extra JSON parameters, ${errMessage}`,
      });
    }

    //Check For Invalid DataTypes
    for (const property in req.body) {
      if (typeof req.body[property] !== "string") {
        errInvalidDataType.push(property);
      }
    }
    if (errInvalidDataType.length > 0) {
      errInvalidDataType.push(`needs to be type [String]`);
      const errMessage = errInvalidDataType.join(", ");
      return res.status(500).json({
        code: "E03",
        // meesage: `Invalid DataType, ${errMessage}`,
      });
    }

    //Check for mandatory fields
    const mandatoryFields = ["username", "password", "Task_id"];

    const notPresentInMandatoryFields = [];
    mandatoryFields.forEach((field) => {
      if (!reqBodyKeys.includes(field)) {
        notPresentInMandatoryFields.push(`${field}`);
      } else if (req.body[field].trim() === "") {
        notPresentInMandatoryFields.push(`${field}`);
      }
    });
    if (notPresentInMandatoryFields.length > 0) {
      notPresentInMandatoryFields.push(`must not be empty.`);
      const errMessage = notPresentInMandatoryFields.join(", ");
      return res.status(500).json({
        code: "E04",
        // message: `Invalid JSON - ${errMessage}`,
      });
    }

    // Check if invalid Login Details
    const user = await a3.loginUser(req.body.username.trim());

    if (!user[0] || req.body.username.trim() !== user[0].username) {
      return res.status(500).json({
        code: "E05",
        // message: "Invalid username or password",
      });
    }
    // Check if password is correct if not also return Invalid Email or Password
    const hashedPasswordFromDB = user[0].userpassword;
    const isPasswordMatched = await bcrypt.compare(
      req.body.password,
      hashedPasswordFromDB
    );
    if (!isPasswordMatched) {
      return res.status(500).json({
        code: "E05",
        // message: "Invalid username or password",
      });
    }
    // Check if user is disabled
    if (!user[0].userisActive) {
      return res.status(500).json({
        code: "E06",
        // message: "User account is inactive",
      });
    }

    req.username = user[0].username;
    delete req.body.username;
    delete req.body.password;

    // Trim the relevant req.body properties
    for (const property in req.body) {
      if (req.body[property] !== "") {
        req.body[property] = req.body[property].trim();
      }
    }
    // For any newMessage
    let newMessage = [];

    const [task] = await a3.getTask(req.body.Task_id);
    if (!task) {
      return res.status(500).json({
        code: "E09",
        // message: "Task id does not exist.",
      });
    }
    const [userGroupFromPermit] = await a3.getAppPermit(task.Task_app_Acronym);

    const authorised = await checkGroup(
      req.username,
      userGroupFromPermit.App_permit_Doing
    );
    if (!authorised[0].RESULT) {
      return res.status(500).json({
        code: "E08",
        // message: "User is not permitted to perform this action.",
      });
    }

    //This is to check if the current State if user is updating the Task which is at correect State
    if (task.Task_state !== "doing") {
      return res.status(500).json({
        code: "E11",
        // message: `Task is not in [Doing] state.`,
      });
    }

    validationFn.changeEmptyFieldsToNull(req.body);
    // This is for all the messages to be displayed based on the audit trail
    if (req.body.Task_notes !== null) {
      newMessage.push(req.body.Task_notes);
    }

    newMessage.push(
      `${req.username} has promoted the task from ${task.Task_state} to done`
    );

    if (newMessage.length > 0) {
      newMessage = newMessage.join("\n ");
    }

    // When the task notes is not empty from the frontend, it retrieve current task notes
    //Format the date to yyyy-mm-dd
    const formattedDate = validationFn.formatDate();
    const formattedTimestamp = validationFn.formatTimeStamp();
    req.body.Task_notes = req.body.Task_notes || [];
    if (req.body.Task_notes.length > 0 || Array.isArray(req.body.Task_notes)) {
      const taskNoteArr = await a3.getTaskNotes(req.body.Task_id);
      if (!taskNoteArr) {
        return res.status(500).json({
          code: "E14",
          // message: "Internal Server Error.",
        });
      }
      let newTaskArr = [];
      const notesObj = {
        username: req.username,
        currentState: task.Task_state,
        date: formattedDate,
        timestamp: formattedTimestamp,
        notes: newMessage,
      };
      newTaskArr = JSON.parse(taskNoteArr[0].Task_notes);
      newTaskArr.push(notesObj);
      req.body.Task_notes = JSON.stringify(newTaskArr);
    }

    req.body.Task_owner = req.username;
    delete req.body.Task_id;
    req.body.Task_state = "done";

    // Data has been sanitized and retrieve accordingly before inserting to database.
    let clauses = [];
    let values = [];
    for (const property in req.body) {
      clauses.push(property + "=?");
      values.push(req.body[property]);
    }
    if (values) {
      values.push(task.Task_id);
    }
    // The above code is to allow me to dynamicly accept any json values
    clauses = clauses.join(",");
    const results2 = await a3.updateTask(clauses, values);

    if (!results2) {
      return res.status(500).json({
        code: "E14",
      });
    }

    if (
      task.Task_state === "doing" &&
      req.body.Task_state === "done" &&
      results2
    ) {
      const message = `${req.username} has completed the \n\nTask Name: ${task.Task_name}\nFrom ${task.Task_state}\nPromoted to ${req.body.Task_state}\n\nwhich requires your approval/rejection to check.`;
      const plEmail = await a3.getPLEmail("pl");

      // Send emails to multiple recipients asynchronously
      const emailPromises = plEmail.map(async (user) => {
        try {
          await sendEmail({
            email: user.useremail,
            subject: `${req.username} promoted the Task Name: ${task.Task_id} from ${task.Task_state} to ${req.body.Task_state}`,
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
        code: "S01",
      });

      // After a small delay, wait for all email promises to complete
      await Promise.all(emailPromises);
    } else {
      // Send the response when no email needs to be sent
      res.status(200).json({
        success: "S01",
      });
    }
  } catch (error) {
    return res.status(500).json({
      code: "E14",
    });
  }
};
