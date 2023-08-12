const a3 = require('../models/a3Model');
const bcrypt = require('bcryptjs');
const checkGroup = require('../utils/checkGroup');

exports.createTask = async (req, res, next) => {
  const errInvalidDataType = [];
  try {
    //Check for Invalid URL
    if (req.originalUrl !== '/createTask') {
      return res.status(500).json({
        code: 'E01',
        message: 'Invalid Url',
      });
    }
    //Check For Invalid DataTypes
    for (const property in req.body) {
      if (typeof req.body[property] !== 'string') {
        errInvalidDataType.push(property);
      }
    }
    if (errInvalidDataType.length > 0) {
      errInvalidDataType.push(`needs to be a string`);
      const errMessage = errInvalidDataType.join(',', ' ');
      return res.status(500).json({
        code: 'E02',
        meesage: `Invalid DataType, ${errMessage}`,
      });
    }
    //Check for Extra Fields
    const extraFields = [
      'username',
      'password',
      'Task_app_Acronym',
      'Task_notes',
      'Task_plan',
      'Task_description',
      'Task_name',
    ];
    const reqBodyKeys = Object.keys(req.body);
    const additionalFieldsPresent = [];
    reqBodyKeys.forEach((field) => {
      if (!extraFields.includes(field)) {
        additionalFieldsPresent.push(field);
      }
    });
    if (additionalFieldsPresent.length > 0) {
      additionalFieldsPresent.push(`is extra field, please remove`);
      const errMessage = additionalFieldsPresent.join(',', ' ');
      return res.status(500).json({
        code: 'E03',
        message: `Invalid JSON, ${errMessage}`,
      });
    }

    //Check for mandatory fields
    const mandatoryFields = [
      'username',
      'password',
      'Task_app_Acronym',
      'Task_description',
      'Task_name',
    ];

    const notPresentInMandatoryFields = [];
    // const mandatoryFieldsAreEmpty = [];
    mandatoryFields.forEach((field) => {
      if (!reqBodyKeys.includes(field)) {
        notPresentInMandatoryFields.push(`${field}`);
      } else if (req.body[field].trim() === '') {
        notPresentInMandatoryFields.push(`${field}`);
      }
    });
    if (notPresentInMandatoryFields.length > 0) {
      notPresentInMandatoryFields.push(`is mandatory and must not be empty.`);
      const errMessage = notPresentInMandatoryFields.join(', ');
      return res.status(500).json({
        code: 'E04',
        message: `Invalid JSON, ${errMessage}`,
      });
    }

    // Check if invalid Login Details
    const user = await a3.loginUser(req.body.username);

    if (!user[0]) {
      return res.status(500).json({
        code: 'E05',
        message: 'Invalid username/password',
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
        code: 'E05',
        message: 'Invalid username/password',
      });
    }
    // Check if user is disabled
    if (!user[0].userisActive) {
      return res.status(500).json({
        code: 'E06',
        message: 'User account is inactive',
      });
    }

    req.username = user[0].username;
    delete req.body.username;
    delete req.body.password;

    const [userGroupFromPermit] = await a3.getAppPermit(
      req.body.Task_app_Acronym
    );
    const authorised = await checkGroup(
      req.username,
      userGroupFromPermit.App_permit_Create
    );
    if (!authorised[0].RESULT) {
      return res.status(500).json({
        code: 'E08',
      });
    }
  } catch (error) {
    return res.status(500).json({
      code: 'E10',
      message: 'Server Error',
    });
  }
};

exports.getTaskByState = async (req, res, next) => {};

exports.promoteTask2Done = async (req, res, next) => {};
