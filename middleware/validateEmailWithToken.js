const error = require('../utils/error');

module.exports = function (req, res, next) {
    const { email } = req.params;
    if (req.user.email !== email) {
        next(new error("Forbidden",403))
    }
    next();
}

