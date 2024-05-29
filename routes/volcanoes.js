var express = require('express');
var router = express.Router();

const checkVolcanoesParams = require('../middleware/checkVolcanoesParams.js');

router.get("/", checkVolcanoesParams, function (req, res, next) {
    const validPopulatedWithin = [
        "5km",
        "10km",
        "30km",
        "100km"
    ];

    if (!req.query.country) {
        return next(new Error("No country given"));
    }
    if (req.query.populatedWithin && !validPopulatedWithin.includes(req.query.populatedWithin)) {
        return next(new Error("Invalid populatedWithin value"));
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
        .catch((err) => {
            console.log(err);
            res.json([]);
        });
});

module.exports = router;