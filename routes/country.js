// provide extra information on a specific country 
var express = require('express');
var router = express.Router();

router.get("/", function (req, res, next) {
    
    req.db
        .from('data').distinct("country").orderBy('country', 'asc').pluck('country')
        .then((countryNames) => {
            res.json(countryNames);
        }).catch((err) => {
            next(err);
        });

});

module.exports = router;