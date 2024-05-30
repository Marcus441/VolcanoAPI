var express = require('express');
var router = express.Router();

const error = require('../utils/error');
const optionalAuth = require('../middleware/optionalAuth.js');
const validateVolcanoId = require('../middleware/validateVolcanoId.js');

router.get("/:id", optionalAuth, validateVolcanoId, function (req, res, next) {
  const id = Number(req.params.id);
  const selectColumns = [
    "id",
    "name",
    "country",
    "region",
    "subregion",
    "last_eruption",
    "summit",
    "elevation",
    "latitude",
    "longitude"
  ];

  // If JWT is present, add population data columns to the query
  if (req.user) {
    selectColumns.push(
      "population_5km",
      "population_10km",
      "population_30km",
      "population_100km",
    );
  }
  req.db
    .from('data').select(...selectColumns)
    .where('id', id)
    .then((rows) => {
      if (rows.length === 0) {
        return next(new error(`Volcano with ID: ${id} not found`, 404));
      }
      res.json(rows[0]);
    })
    .catch((err) => {
      next(err);
    });
});
module.exports = router;