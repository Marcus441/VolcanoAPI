var express = require('express');
var router = express.Router();

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');
const authorize = require('../middleware/authorization.js');
const authorization = require('../middleware/authorization.js');

router.use('/', swaggerUI.serve);
router.get('/', swaggerUI.setup(swaggerDocument));


router.get("/countries", function (req, res, next) {
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

function checkVolcanoesParams(req, res, next) {
  const validParams = ['country', 'populatedWithin'];
  for (let param in req.query) {
    if (!validParams.includes(param)) {
      return next(new Error("params are not country or populatedWithin"));
    }
  }
  next();
}

router.get("/volcanoes", checkVolcanoesParams,  function (req, res, next) {
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

const optionalAuth = (req, res, next) => {
  if ("authorization" in req.headers) {
      // Use authorization middleware if Authorization header is present
      authorization(req, res, next);
  } else {
      // Skip authorization if Authorization header is not present
      next();
  }
};

router.get("/volcano/:id", optionalAuth, function (req, res, next) {
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
