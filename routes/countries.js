var express = require('express');
var router = express.Router();


router.get("/", function (req, res, next) {
    req.db
      .from('data').distinct("country").orderBy('country', 'asc').pluck('country')
      .then((countryNames) => {
        res.json(countryNames);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({
          error: true,
          message: "Invalid query parameters. Query parameters are not permitted."
        });
      });
  });

  module.exports = router;