var express = require('express');
var router = express.Router();

const error = require('../utils/error.js');
const checkVolcanoesParams = require('../middleware/checkVolcanoesParams.js');

router.get("/", checkVolcanoesParams, function (req, res, next) {
    const validPopulatedWithin = [
        "5km",
        "10km",
        "30km",
        "100km"
    ];

    if (!req.query.country) {
        return next(new error("No country given", 400));
    }
    if (req.query.populatedWithin && !validPopulatedWithin.includes(req.query.populatedWithin)) {
        return next(new error("Invalid value for populatedWithin. Only: 5km,10km,30km,100km are permitted", 400));
    }
    const country = req.query.country;
    const populatedWithin = req.query.populatedWithin ? `population_${req.query.populatedWithin}` : '';

    let query = req.db
        .from('data').select("id", "name", "country", "region", "subregion").where('country', country);

    if (populatedWithin) {
        query = query.andWhere(populatedWithin, '>', 0);
    }

    query.then((rows) => {
        res.json(rows);
    })
});

module.exports = router;