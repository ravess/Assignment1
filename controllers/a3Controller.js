const a3 = require("../models/a3Model");
const bcrypt = require("bcryptjs");
const checkGroup = require("../utils/checkGroup");

exports.createTask = async (req, res, next) => {
  const errInvalidDataType = [];
  try {
    //Check for Invalid URL
    if (req.originalUrl !== "/createTask") {
      return res.status(500).json({
        code: "E01",
        message: "Invalid Url",
      });
    }
    //Check For Invalid DataTypes
    for (const property in req.body) {
      if (typeof req.body[property] !== "string") {
        errInvalidDataType.push(property);
      }
    }
    if (errInvalidDataType.length > 0) {
      errInvalidDataType.push(`needs to be a string`);
      const errMessage = errInvalidDataType.join(",", " ");
      return res.status(500).json({
        code: "E02",
        meesage: `Invalid DataType, ${errMessage}`,
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
    const reqBodyKeys = Object.keys(req.body);
    const additionalFieldsPresent = [];
    reqBodyKeys.map((field) => {
      if (!extraFields.includes(field)) {
        additionalFieldsPresent.push(field);
      }
    });
    if (additionalFieldsPresent.length > 0) {
      additionalFieldsPresent.push(`is extra field, please remove`);
      const errMessage = additionalFieldsPresent.join(",", " ");
      return res.status(500).json({
        code: "E03",
        message: `Invalid JSON, ${errMessage}`,
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
    mandatoryFields.map((field) => {
      if (!reqBodyKeys.includes(field)) {
        notPresentInMandatoryFields.push(field);
      }
    });
    if (notPresentInMandatoryFields.length > 0) {
      notPresentInMandatoryFields.push(`is mandatory.`);
      const errMessage = notPresentInMandatoryFields.join(",", " ");
      return res.status(500).json({
        code: "E04",
        message: `Invalid JSON, ${errMessage}`,
      });
    }
    // For DB querying
    res.status(200).json({
      code: "S01",
      message: "hahah testing",
    });
    const user = await a3.loginUser(req.username);
    // Check if there is user in database, if not return Invalid Email or Password
    if (!user[0]) {
      return res.status(500).json({
        code: "E05",
        message: "Invalid username/password",
      });
    }
    // Check if password is correct if not also return Invalid Email or Password
    const hashedPasswordFromDB = user[0].userpassword;
    const isPasswordMatched = await bcrypt.compare(
      userpassword,
      hashedPasswordFromDB
    );
    if (!isPasswordMatched) {
      return res.status(500).json({
        code: "E05",
        message: "Invalid username/password",
      });
    }
    // Check if user is disabled
    if (!user[0].userisActive) {
      return res.status(500).json({
        code: "E06",
        message: "User account is inactive",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getTaskByState = async (req, res, next) => {};

exports.promoteTask2Done = async (req, res, next) => {};
