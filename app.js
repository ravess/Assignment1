const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');

const app = express();
const port = 3000;

const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler');
// Setting up config.env files variables **config files has to be loaded before routes and database connection made
dotenv.config({ path: './.env' });

// Handling Uncaught Exception before database, has to be near the top here.
process.on('uncaughtException', (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log(`Shutting down due to uncaught exception`);
  process.exit(1);
});

// Inititalize the app and add middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Setup the body/json parser to handle form submits
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
); // Session setup

const auth = require('./routes/authRoute');
const admin = require('./routes/adminRoute');
const user = require('./routes/userRoute');
app.use('/api/v1', auth);
app.use('/api/v1', admin);
app.use('/api/v1', user);

// Handled unhandled routes (make sure is below the routes)
app.all('*', (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

// Middlewares to handle error
app.use(errorMiddleware);

/** App listening on port */
app.listen(port, () => {
  console.log(`MyAssignment1 app listening at http://localhost:${port}`);
});

// Handling unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.stack}`);
  console.log(`Shutting down the server due to unhandled promise rejection.`);
  server.close(() => {
    process.exit(1);
  });
});
