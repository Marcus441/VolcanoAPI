module.exports = function (req, res, next) {
    const { email } = req.params;
    if (req.user.email !== email) {
        res.status(403).json({
            error: true,
            message: "Forbidden."
        });
        return;
    }
    next();
}

