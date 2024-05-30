var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const options = require("./knexfile.js");
const knex = require("knex")(options);
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

require("dotenv").config();

var swaggerRouter = require('./routes/swagger');
var countriesRouter = require('./routes/countries');
var countryRouter = require('./routes/country');
var volcanoRouter = require('./routes/volcano');
var volcanoesRouter = require('./routes/volcanoes');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  req.db = knex;
  next();
});
app.use(cors());

//routes
app.use('/', swaggerRouter);
app.use('/countries', countriesRouter);
app.use('/country', countryRouter);
app.use('/volcano', volcanoRouter);
app.use('/volcanoes', volcanoesRouter);
app.use('/user', usersRouter);
app.get('/me', function (req, res) {
  res.json({
    name: "Marcus Camaroni",
    student_number: "n11240296"
  });
});
// catch 404
app.use(function (req, res, next) {
  res.status(404).json({
    error: true,
    message: "Page not found!"
  });
});

// error handler
app.use(errorHandler);

module.exports = app;
