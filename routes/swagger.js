var express = require('express');
var router = express.Router();

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');


router.use('/', swaggerUI.serve);
router.get('/', swaggerUI.setup(swaggerDocument));


module.exports = router;




