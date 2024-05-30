// validationMiddleware.js
const error = require('../utils/error');

module.exports = function (req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    next(new error("Invalid query parameters. Query parameters are not permitted.", 400));
    return;
  }
  next();
}

