// const bcrypt = require("bcryptjs");
const ErrorHandler = require('./errorHandler');
const validationFn = {
  validatePassword: async (userpassword) => {
    const rePassword = new RegExp(
      '^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,10}$'
    );

    if (!rePassword.test(userpassword)) {
      console.log(`it didnt validate`);
      throw new ErrorHandler(
        'You are require to set the pw which have min 8 chars & max 10 chars which is alphanumeric and a special char',
        400
      );
    }
  },
  nullForEmailAndUsergroup: (reqBodyObj) => {
    for (const property in reqBodyObj) {
      if (
        (property === 'useremail' || property === 'usergroup') &&
        reqBodyObj[property] === ''
      ) {
        reqBodyObj[property] = null;
      }
    }
  },
  deleteEmptyFields: (reqBodyObj) => {
    for (const property in reqBodyObj) {
      if (reqBodyObj[property] === '') {
        delete reqBodyObj[property];
      }
    }
  },
  changeEmptyFieldsToNull: (reqBodyObj) => {
    for (const property in reqBodyObj) {
      if (reqBodyObj[property] === '') {
        reqBodyObj[property] = null;
      }
    }
  },
  removewhitespaces: (reqBodyObj) => {
    for (const property in reqBodyObj) {
      if (property === 'Plan_MVP_name' && reqBodyObj[property] !== null) {
        reqBodyObj[property] = reqBodyObj[property].replace(/\s/g, '').trim();
      }
    }
  },
  concatPermitWith: (reqBodyObj) => {
    for (const property in reqBodyObj) {
      if (
        property === 'App_permit_Open' ||
        property === 'App_permit_toDoList' ||
        property === 'App_permit_Doing' ||
        (property === 'App_permit_Done' && reqBodyObj[property] !== null)
      ) {
        reqBodyObj[property] = '.' + reqBodyObj[property] + '.';
      }
    }
  },
};
module.exports = validationFn;
