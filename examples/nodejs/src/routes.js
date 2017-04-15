'use strict';

var express = require('express');
var controllers = require('./controllers');

function routes(app) {
  app.get('/', controllers.main.index);
  app.get('/sign/:videoId', controllers.main.sign);
  app.post('/ingest/:videoId', controllers.main.ingest);
  app.post('/upload', controllers.main.upload);
  app.use('/static/js', express.static('../..'));
}

module.exports = routes;
