const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");

const app = express();
const port = 3000;

// Setting up config.env files variables **config files has to be loaded before routes and database connection made
dotenv.config({ path: "./.env" });

const errorMiddleware = require("./middlewares/errors");
const ErrorHandler = require("./utils/errorHandler");

// Inititalize the app and add middleware
app.set("view engine", "pug"); // Setup the pug can take out later since we using react
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Setup the body/json parser to handle form submits
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
); // Session setup

const user = require("./routes/userRoute");
app.use("/api/v1", user);

// Handled unhandled routes (make sure is below the routes)
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

// Middlewares to handle error
app.use(errorMiddleware);

/** App listening on port */
app.listen(port, () => {
  console.log(`MyAssignment1 app listening at http://localhost:${port}`);
});
