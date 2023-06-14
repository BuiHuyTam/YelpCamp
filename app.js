if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require('connect-flash');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./helpers/ExpressError");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require("connect-mongo");

//chua cai dat pakage helmet 
// const helmet = require("helmet");

const { wrap } = require("module"); //what the hell is this ????

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const { date } = require("joi");

const app = express();
const port = process.env.PORT || 3000;
const db = mongoose.connection;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
})

//Session 
app.use(
  session({
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(flash());

// app.use(helmet());
// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//       directives: {
//           defaultSrc: [],
//           connectSrc: ["'self'", ...connectSrcUrls],
//           scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//           styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//           workerSrc: ["'self'", "blob:"],
//           objectSrc: [],
//           imgSrc: [
//               "'self'",
//               "blob:",
//               "data:",
//               "https://res.cloudinary.com/jjred/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//               "https://images.unsplash.com/",
//           ],
//           fontSrc: ["'self'", ...fontSrcUrls],
//       },
//   })
// );

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use( (req, res, next) => {
  if (!['/login', '/'].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);
app.get("/", (req, res) => {
  res.render("home");
});

//middleware
app.all("*", (req, res, next) => {
  next(new ExpressError("That's an error", 404));
});

//Eror handling middleware
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Something went wrong"; //neu khac cai message ma duoc truyen tu next vao thi err.message se co gia tri mac dinh nhu vay
  res.status(status).render("error", { err });
});

app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}`);
});
