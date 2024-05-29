const error = require("../utils/error");

module.exports = function (req, res, next) {
    const validParams = ['country', 'populatedWithin'];
    for (let param in req.query) {
        if (!validParams.includes(param)) {
            return next(new error("params are not country or populatedWithin", 400));
        }
    }
    next();
}
