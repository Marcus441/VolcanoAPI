var express = require('express');
var router = express.Router();


router.get("/", function (req, res, next) {
  if (req.params.length > 0) {
    next(new error("Invalid query parameters. Query parameters are not permitted.",400))
  }
  req.db
    .from('data').distinct("country").orderBy('country', 'asc').pluck('country')
    .then((countryNames) => {
      res.json(countryNames);
    }).catch((err) => {
      next(err);
    });
});

module.exports = router;