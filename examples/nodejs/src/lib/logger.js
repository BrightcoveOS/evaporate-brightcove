'use strict';

var Bunyan = require('bunyan');
var config = require('../config');

var logger = Bunyan.createLogger({
  name: config.app,
  streams: [{
    stream: process.stdout,
    level: config.logging.level
  }]
});

function getCategory(callingModule) {
  var parts = callingModule.filename.split('/');
  var index = parts.length - 1;
  while ((index > 0) && (parts[index] !== 'src')) {
    index -= 1;
  }
  return parts.slice(index + 1).join('/');
}

module.exports = function(callingModule) {
  return logger.child({category: getCategory(callingModule)});
};
