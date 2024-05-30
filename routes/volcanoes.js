var express = require('express');
var router = express.Router();

const getVolcanoesValidation = require('../middleware/getVolcanoesValidation.js');
const postVolcanoesValidation = require('../middleware/postVolcanoesValidation.js');
const authorization = require('../middleware/authorization.js');

router.get("/", getVolcanoesValidation, function (req, res, next) {

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


// can test this using:
// curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTcxMTQ5MjAsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTcxNzAyODUyMH0.pR6IIwH5zxFBmxoFtgerKwCCX6tSjgjs-LgVxf3tQo8" -d '{"name":"New Volcano","country":"New Country","region":"Region","subregion":"Subregion","last_eruption":"2022 CE","summit":1000,"elevation":2000,"population_5km":500,"population_10km":1000,"population_30km":3000,"population_100km":10000,"latitude":10.1234,"longitude":20.1234}' http://localhost:3000/volcanoes
// New POST /volcanoes endpoint
router.post("/", postVolcanoesValidation, authorization, function (req, res, next) {

    req.db('data').insert(req.body).then(() => {
        res.json(req.body);
    }).catch((err) => {
        next(err);
    });

});

module.exports = router;