var express = require('express');
var router = express.Router();

const optionalAuth = require('../middleware/optionalAuth.js');

router.get("/:id", optionalAuth, function (req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return next(new Error("ID must be an integer"));
    }
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
          throw new Error("Invalid volcano id");
        }
        res.json(rows[0]);
      })
      .catch((err) => {
        switch (err.message) {
          case "Invalid volcano id":
            res.status(404).json({ "error": true, "message": `Volcano with ID: ${id} not found` });
            break;
          case "ID must be an integer":
            console.log(err);
            res.status(400).json({ "error": true, "message": "Invalid query parameters. Query parameters are not permitted." });
            break;
        }
      });
  });
  module.exports = router;