module.exports = function (req, res, next) {
    if (Object.keys(req.query).length > 0) {
        next(new Error("Invalid query parameters. Query parameters are not permitted.", 400));
    } else {
        next();
    }
}
