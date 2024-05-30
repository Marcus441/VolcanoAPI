const error = require("../utils/error");

module.exports = async function (req, res, next) {

    const requiredFields = [
        'name',
        'country',
        'region',
        'subregion',
        'last_eruption',
        'summit',
        'elevation',
        'latitude',
        'longitude',
        'population_5km',
        'population_10km',
        'population_30km',
        'population_100km'];
    // check if all required fields are present
    if (!requiredFields.every(field => req.body.hasOwnProperty(field))) {
        const missingFields = requiredFields.filter(field => !req.body.hasOwnProperty(field))
        next(new error(`Missing required fields: ${missingFields}`, 400));
    }
    // check if country is a real country
    try {
        const countryExists = await req.db('data').select("country").where('country', req.body.country);
        if (!countryExists || countryExists.length === 0) {
            return next(new error("Country not found", 404));
        }
    } catch (err) {
        next(new error("Error while checking country", 500));
    }
    // check if last_eruption is a valid year
    const lastEruption = req.body.last_eruption;
    const lastEruptionPattern = /^(\d+) (CE|BCE)$/;
    const matches = lastEruptionPattern.exec(lastEruption);
    if (!matches) {
        return next(new error("Invalid last_eruption year", 400));
    }
    const year = Number(matches[1]);
    const era = matches[2];
    if (era === 'BCE' && (year < 1)) {
        return next(new error("Invalid last_eruption year", 400));
    }
    if (era === 'CE' && (year < 1 || year > new Date().getFullYear())) {
        return next(new error("Invalid last_eruption year", 400));
    }
    // check if numeric fields are valid
    const numericFields = ['summit', 'elevation', 'population_5km', 'population_10km', 'population_30km', 'population_100km'];
    for (let field of numericFields) {
        if (isNaN(req.body[field]) || req.body[field] < 0) {
            return next(new error(`Invalid ${field} value`, 400));
        }
    }
    // check if latitude is a valid number
    if (isNaN(req.body.latitude) || req.body.latitude < -90 || req.body.latitude > 90) {
        return next(new error("Invalid latitude value", 400));
    }
    // check if longitude is a valid number
    if (isNaN(req.body.longitude) || req.body.longitude < -180 || req.body.longitude > 180) {
        return next(new error("Invalid longitude value", 400));
    }
    next();
}


