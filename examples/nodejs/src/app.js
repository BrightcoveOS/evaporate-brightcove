'use strict';

var path = require('path');
var express = require('express');
var expressLogger = require('express-bunyan-logger');
var handlebars = require('handlebars');
var exphbs = require('express-handlebars');
var helmet = require('helmet');
var bodyParser = require('body-parser');
var rollbar = require('rollbar');
var config = require('./config');
var logger = require('./lib/logger')(module);
var routes = require('./routes');

var app = express();
module.exports = app;

var hbs = exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  handlebars: handlebars
});

app.use(expressLogger({
  name: config.app,
  streams: [{
    stream: process.stdout,
    level: config.logging.level
  }],
  parseUA: false,
  excludes: ['req', 'res', 'req-headers', 'res-headers', 'incoming', 'short-body', 'response-hrtime', 'body']
}));

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.engine('.hbs', hbs);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '../views'));

routes(app);

app.use(express.static(__dirname + '/../public'));

if (config.rollbar.enabled) {
  logger.info('Rollbar is enabled and will report express errors and uncaught exceptions');
  app.use(rollbar.errorHandler(config.rollbar.token, {
    environment: config.env
  }));
  rollbar.handleUncaughtExceptions(config.rollbar.token, {
    exitOnUncaughtException: true,
    environment: config.env
  });
} else {
  logger.info('Rollbar is not enabled');
}
