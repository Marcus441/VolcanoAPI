const error = require("../utils/error");

module.exports = function (req, res, next) {
    const { firstName, lastName, dob, address } = req.body;
  
    // Check if the email from the token does not match the email in the request parameters

    if (!firstName || !lastName || !dob || !address) {
      return next(new error("Request body incomplete: firstName, lastName, dob and address are required.", 400));
    }
    if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof address !== 'string' || typeof dob !== 'string') {
      return next(new error("Request body invalid: firstName, lastName and address must be strings only.", 400));
    }
  
    const dobFormat = /^\d{4}-\d{2}-\d{2}$/;
    const [year, month, day] = dob.split('-');
    const date = new Date(dob);
    const currentDate = new Date();
  
    if (!dobFormat.test(dob)
      || isNaN(date.getTime())
      || date.getUTCFullYear() !== Number(year)
      || date.getUTCMonth() + 1 !== Number(month)
      || date.getUTCDate() !== Number(day)) {
      return next(new error("Invalid input: dob must be a real date in format YYYY-MM-DD.", 400));
    }
  
    if (date > currentDate) {
      return next(new error("Invalid input: dob must be a date in the past.", 400));
    }
  
    next();
  }