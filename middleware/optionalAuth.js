const authorization = require('../middleware/authorization.js');

module.exports = function (req, res, next) {
    if ("authorization" in req.headers) {
        // Use authorization middleware if Authorization header is present
        authorization(req, res, next);
    } else {
        // Skip authorization if Authorization header is not present
        next();
    }
};
