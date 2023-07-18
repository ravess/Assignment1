// const bcrypt = require("bcryptjs");
const ErrorHandler = require("./errorHandler");
const validationFn = {
  validatePassword: async (userpassword) => {
    const rePassword = new RegExp(
      "^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,10}$"
    );

    if (!rePassword.test(userpassword)) {
      console.log(`it didnt validate`);
      throw new ErrorHandler(
        "You are require to set the pw which have min 8 chars & max 10 chars which is alphanumeric and a special char",
        400
      );
    }
  },
  deleteEmptyFields: (reqBodyObj) => {
    for (const property in reqBodyObj) {
      if (reqBodyObj[property] === "") {
        delete reqBodyObj[property];
      }
    }
  },
};
module.exports = validationFn;
