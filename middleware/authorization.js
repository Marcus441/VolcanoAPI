const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
    if (!("authorization" in req.headers)
        || !req.headers.authorization.match(/^Bearer /)
    ) {
        req.user = null;
        next();
        return;
    }
    const token = req.headers.authorization.replace(/^Bearer /, "");
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        req.user = null;
    }

    next();
};