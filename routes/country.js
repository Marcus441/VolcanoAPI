// provide extra information on a specific country 
var express = require('express');
var router = express.Router();

const noQueryParamsAllowed = require('../middleware/noQueryParamsAllowed');

router.get("/:country", noQueryParamsAllowed,function (req, res, next) {
    const country = req.params.country;

    req.db
        .from('data')
        .where('country', country)
        .count('id as volcanoCount')
        .min('elevation as minElevation')
        .max('elevation as maxElevation')
        .sum('population_5km as population5km')
        .sum('population_10km as population10km')
        .sum('population_30km as population30km')
        .sum('population_100km as population100km')
        .first()
        .then((data) => {
            if (data.volcanoCount === 0) {
                return next(new Error(`No data found for country: ${country}`, 404));
            }
            res.json(data);
        }).catch((err) => {
            next(err);
        });
});

module.exports = router;