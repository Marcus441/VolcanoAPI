var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authorization = require('../middleware/authorization.js');
const optionalAuth = require('../middleware/optionalAuth.js');
const validateProfileRequest = require('../middleware/validateProfileRequest.js');
const validateEmailWithToken = require('../middleware/validateEmailWithToken.js');

router.post('/register', function (req, res, next) {
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
      if (rows.length === 0) {
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);
        return req.db.from('users').insert({ email, hash });
      }
      throw new Error("User already exists");
    }).then(() => {
      res.status(201).json({ message: "User created" });
    }).catch((err) => {
      // 2.2 If user does exist, return error response
      console.log(`Error: ${err.message}`); // Log any errors
      res.status(409).json({ error: true, message: err.message });
    });
});

router.post('/login', function (req, res, next) {
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
      if (rows.length === 0) {
        throw new Error("User does not exist");
      }
      const user = rows[0];
      return bcrypt.compare(password, user.hash);
    }).then((match) => {
      if (!match) {
        throw new Error("Incorrect email or password");
      }
      const expires_in = 60 * 60 * 24; // 24 hours
      const exp = Math.floor(Date.now() / 1000) + expires_in;
      const token = jwt.sign({ exp, email }, JWT_SECRET);
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

router.put("/:email/profile", authorization, validateProfileRequest, validateEmailWithToken, function (req, res, next) {
  const { email } = req.params;
  const { firstName, lastName, dob, address } = req.body;

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

router.get("/:email/profile", optionalAuth, function (req, res, next) {
  const { email } = req.params;
  const selectColumns = [
    "email",
    "firstName",
    "lastName",
  ];
  if (req.user && req.user.email === email) {
    selectColumns.push("dob", "address");
  }

  req.db.from('users').select(selectColumns).where('email', email)
    .then((rows) => {
      if (rows.length === 0) {
        throw new Error("User does not exist");
      }
      return res.json(rows[0]);
    }).catch((err) => {
      console.log(err);
      res.status(404).json({ error: true, message: err.message });
    });
});

module.exports = router;
