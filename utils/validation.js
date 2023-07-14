const bcrypt = require("bcryptjs");
const ErrorHandler = require("./errorHandler");
const validationFn = {
  validatePassword: (userpassword) => {
    const rePassword = new RegExp(
      "^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,10}$"
    );

    if (!rePassword.test(userpassword)) {
      return next(
        new ErrorHandler(
          "You are require to set the pw which have min 8 chars & max 10 chars which is alphanumeric and a special char",
          400
        )
      );
    }
    // Not sure hashpassword can put in here, Roy to come back check
    // const hashedpassword = bcrypt.hash(userpassword, 15, function (err, hash) {
    //   if (err) {
    //     return next(new ErrorHandler("Unable to hash password", 500));
    //   }
    //   return hash;
    // });
    // return hashedpassword;
  },
  validateEmptyFields: (reqBodyObj) => {
    for (const property in reqBodyObj) {
      if (reqBodyObj[property] === "") {
        return next(new ErrorHandler("Please do not leave any field blanks."));
      }
    }
  },
};

module.exports = validationFn;
