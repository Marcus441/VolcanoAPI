var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const options = require("./knexfile.js");
const knex = require("knex")(options);
const cors = require('cors');

require("dotenv").config();

var swaggerRouter = require('./routes/swagger');
var countriesRouter = require('./routes/countries');
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
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  switch (err.message) {
    case "ID must be an integer":
      res.status(400).json({
        error: true,
        message: "ID must be an integer"
      });
      break;
    case "No country given":
      res.status(400).json({
        error: true,
        message: "Country is a required query parameter."
      });
      break;
    case "Invalid populatedWithin value":
      res.status(400).json({
        error: true,
        message: "Invalid value for populatedWithin. Only: 5km,10km,30km,100km are permitted"
      });
      break;
    case "params are not country or populatedWithin":
      res.status(400).json({
        error: true,
        message: "Invalid query parameters. Only country and populatedWithin are permitted."
      });
      break;
    default:
      // render the error page
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'Error Page' 
      });
  }

});

module.exports = app;
