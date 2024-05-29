var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const authorization = require('../middleware/authorization.js');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function (req, res, next) {
  // 1. Retrieve email and password from req.body
  const { email, password } = req.body;
  console.log(`Registering user with email: ${email}`); // Log the email of the user being registered

  // 2. Determine if user already exists in table
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
    return;
  }

  req.db.from('users').select('*').where('email', email)
    // 2.1 If user does not exist, insert into table
    .then((rows) => {
      if (rows.length === 0) {
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);
        console.log(`User does not exist, inserting into table`); // Log that the user is being inserted into the table
        return req.db.from('users').insert({ email, hash });
      }
      throw new Error("User already exists");
    }).then(() => {
      console.log(`User created successfully`); // Log that the user was created successfully
      res.status(201).json({ message: "User created" });
    }).catch((err) => {
      // 2.2 If user does exist, return error response
      console.log(`Error: ${err.message}`); // Log any errors
      res.status(409).json({ error: true, message: err.message });
    });
});

router.post('/login', function (req, res, next) {
  // 1. Retrieve email and password from req.body
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
    return;
  }
  req.db.from('users').select('*').where('email', email)
    .then((rows) => {
      // 2. Determine if user already exists in table
      if (rows.length === 0) {
        throw new Error("User does not exist");
      }
      // 2.1 If user does exist, verify if passwords match
      const user = rows[0];
      return bcrypt.compare(password, user.hash);
    }).then((match) => {
      if (!match) {
        throw new Error("Incorrect email or password");
      }
      const expires_in = 60 * 60 * 24; // 24 hours
      const exp = Math.floor(Date.now() / 1000) + expires_in;
      const token = jwt.sign({ exp }, JWT_SECRET);
      // 2.1.1 If passwords match, return JWT
      res.status(200).json({
        token_type: "Bearer",
        token,
        expires_in
      });
    }).catch((err) => {
      // 2.1.2 If passwords do not match, return error response
      console.log(err);
      res.status(401).json({ error: true, message: err.message });
    });
});

router.put("/:email/profile", authorization, function (req, res, next) {
  const { email } = req.params;
  const { firstName, lastName, dob, address } = req.body;

  if (!firstName || !lastName || !dob || !address) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete: firstName, lastName, dob and address are required."
    });
    return;
  }
  const dobFormat = /^\d{4}-\d{2}-\d{2}$/;
  const [year, month, day] = dob.split('-');
  const date = new Date(dob);
  const currentDate = new Date();
    // Check if dob is in the 'YYYY-MM-DD' format, is a valid date, and the day and month are the same as in the dob string
  if (!dobFormat.test(dob)
    || isNaN(date.getTime())
  || date.getUTCFullYear() !== Number(year)
  || date.getUTCMonth() + 1 !== Number(month)
  || date.getUTCDate() !== Number(day)) {
    res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
    });
    return;
  }
  // Check if the date is in the future
  console.log("Given date", date);
  console.log("Current date", currentDate);
  if (date > currentDate) {
    res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a date in the past."
    });
    return;
  }
  if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof address !== 'string') {
    res.status(400).json({
      error: true,
      message: "Request body invalid: firstName, lastName and address must be strings only."
    });
    return;
  }
  // Check if the email from the token does not match the email in the request parameters
  if (req.user.email !== email) {
    res.status(403).json({
      error: true,
      message: "Forbidden."
    });
    return;
  }

  req.db.from('users').select('*').where('email', email)
    .then((rows) => {
      if (rows.length === 0) {
        throw new Error("User does not exist");
      }
      return req.db.from('users').where('email', email).update({ firstName, lastName, dob, address });
    }).then(() => {
      res.status(200).json({
        email: email,
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        address: address
      });
    }).catch((err) => {
      console.log(err);
      res.status(400).json({ error: true, message: err.message });
    });


});
module.exports = router;
