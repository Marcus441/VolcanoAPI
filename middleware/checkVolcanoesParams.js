module.exports = function (req, res, next) {
    const validParams = ['country', 'populatedWithin'];
    for (let param in req.query) {
        if (!validParams.includes(param)) {
            return next(new Error("params are not country or populatedWithin"));
        }
    }
    next();
}
