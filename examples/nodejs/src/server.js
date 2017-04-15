'use strict';

var config = require('./config');
var app = require('./app');
var logger = require('./lib/logger')(module);

app.listen(config.server.port, function() {
  logger.info('listening at port ' + config.server.port);
});
