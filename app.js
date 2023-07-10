const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');

const app = express();
const port = 3000;

// Setting up config.env files variables **config files has to be loaded before routes and database connection made
dotenv.config({ path: './.env' });

const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler');

// Inititalize the app and add middleware
app.set('view engine', 'pug'); // Setup the pug
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Setup the body parser to handle form submits
app.use(
  session({ secret: 'super-secret', resave: true, saveUninitialized: true })
); // Session setup

const user = require('./routes/userRoute');
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

/** Handle login display and form submit */
/*
app.get("/login", (req, res) => {
    console.log(req.body)
  if (req.session.isLoggedIn === true) {
    return res.redirect("/");
  }
  res.render("login", { error: false });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "bob" && password === "1234") {
    req.session.isLoggedIn = true;
    res.redirect(req.query.redirect_url ? req.query.redirect_url : "/");
  } else {
    res.render("login", { error: "Username or password is incorrect" });
  }
});
*/

/** Handle logout function */
/*
app.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  res.redirect("/");
});
*/
/** Simulated bank functionality */
/*
app.get("/", (req, res) => {
  res.render("index", { isLoggedIn: req.session.isLoggedIn });
});

app.get("/balance", (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send("Your account balance is $1234.52");
  } else {
    res.redirect("/login?redirect_url=/balance");
  }
});

app.get("/account", (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send("Your account number is ACL9D42294");
  } else {
    res.redirect("/login?redirect_url=/account");
  }
});

app.get("/contact", (req, res) => {
  res.send("Our address : 321 Main Street, Beverly Hills.");
});
*/
