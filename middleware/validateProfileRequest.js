module.exports = function (req, res, next) {
    const { firstName, lastName, dob, address } = req.body;
  
    // Check if the email from the token does not match the email in the request parameters
  
    if (!firstName || !lastName || !dob || !address) {
      return res.status(400).json({
        error: true,
        message: "Request body incomplete: firstName, lastName, dob and address are required."
      });
    }
  
    if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof address !== 'string' || typeof dob !== 'string') {
      return res.status(400).json({
        error: true,
        message: "Request body invalid: firstName, lastName and address must be strings only."
      });
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
      return res.status(400).json({
        error: true,
        message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
      });
    }
  
    if (date > currentDate) {
      return res.status(400).json({
        error: true,
        message: "Invalid input: dob must be a date in the past."
      });
    }
  
    next();
  }