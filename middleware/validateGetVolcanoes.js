const error = require("../utils/error");

module.exports = function (req, res, next) {
            // check if country is present
            if (!req.query.country) {
                return next(new error("No country given", 400));
            }
            // check if populatedWithin is a valid value
            const validPopulatedWithin = [
                "5km",
                "10km",
                "30km",
                "100km"
            ];
            if (req.query.populatedWithin && !validPopulatedWithin.includes(req.query.populatedWithin)) {
                const errMessage = "Invalid value for populatedWithin. Only: 5km,10km,30km,100km are permitted";
                return next(new error(errMessage, 400));
            }
            // check if any other query params are present
            const validParams = ['country', 'populatedWithin'];
            for (let param in req.query) {
                if (!validParams.includes(param)) {
                    return next(new error("params are not country or populatedWithin", 400));
                }
            }
            
    next();
}