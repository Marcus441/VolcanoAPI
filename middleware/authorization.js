// @ts-ignore
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (!("authorization" in req.headers)) {
        res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
        return;
    }
    if (!req.headers.authorization.match(/^Bearer /)) {
        res.status(401).json({ error: true, message: "Authorization header is malformed" });
        return;
    }
    const token = req.headers.authorization.replace(/^Bearer /, "");
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: true, message: "JWT token has expired" });
        } else if (e instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: true, message: "Invalid JWT token" });
        }
        return;
    }

    next();
};

