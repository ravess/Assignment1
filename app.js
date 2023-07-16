const express = require('express');
// const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();
const port = 8000;

const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler');
// Setting up config.env files variables **config files has to be loaded before routes and database connection made
dotenv.config({ path: './.env' });

//TO check for cookie
app.use(cookieParser());
// Allow frontend app to talk to backendurl
app.use(
  cors({
    origin: process.env.FRONTENDURL,
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// Handling Uncaught Exception before database, has to be near the top here.
process.on('uncaughtException', (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log(`Shutting down due to uncaught exception`);
  process.exit(1);
});

// Inititalize the app and add middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Setup the body/json parser to handle form submits

//Create active session
// const activeSessions = {};

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET, // Set a secret for session cookie encryption
//     resave: false, // Don't save the session if unmodified
//     saveUninitialized: false, // Don't create a session until something is stored
//     cookie: {
//       secure: false, // Set to true if using HTTPS
//       maxAge: 600000, // Session expiration time (in milliseconds)
//     },
//   })
// );
// Session setup

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
