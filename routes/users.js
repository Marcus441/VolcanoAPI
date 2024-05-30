var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const error = require('../utils/error');
const authorization = require('../middleware/authorization.js');
const optionalAuth = require('../middleware/optionalAuth.js');
const validateProfileRequest = require('../middleware/validateProfileRequest.js');
const validateEmailWithToken = require('../middleware/validateEmailWithToken.js');
const credentialsRequired = require('../middleware/credentialsRequired.js');

router.post('/register', credentialsRequired, function (req, res, next) {
  const { email, password } = req.body;

  req.db.from('users').select('*').where('email', email)
    .then((rows) => {
      if (rows.length === 0) {
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);
        return req.db.from('users').insert({ email, hash });
      }
      next(new error("User already exists", 409));
    }).then(() => {
      res.status(201).json({ message: "User created" });
    }).catch((err) => {
      next(err);
    });
});

router.post('/login', credentialsRequired, function (req, res, next) {
  const { email, password } = req.body;

  req.db.from('users').select('*').where('email', email)
    .then((rows) => {
      if (rows.length === 0) {
        throw new Error("Incorrect email or password");
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
      next(err);
    });
});

router.put("/:email/profile", authorization, validateProfileRequest, validateEmailWithToken, function (req, res, next) {
  const { email } = req.params;
  const { firstName, lastName, dob, address } = req.body;

  req.db.from('users').select('*').where('email', email)
    .then((rows) => {
      if (rows.length === 0) {
        next(new error("User does not exist", 404));
        return;
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
      next(err);
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
        next(new error("User does not exist", 404));
        return;
      }
      return res.json(rows[0]);
    }).catch((err) => {
      next(err);
    });
});

module.exports = router;
