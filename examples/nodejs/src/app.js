'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var expressLogger = require('express-bunyan-logger');

var controllers = require('./controllers');
var config = require('./config');

var app = express();

app.use(expressLogger({
  name: require('../package.json').name,
  parseUA: false,
  excludes: ['req', 'res', 'req-headers', 'res-headers', 'incoming', 'short-body', 'response-hrtime', 'body']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', controllers.index);
app.get('/sign/:videoId', controllers.sign);
app.post('/ingest/:videoId', controllers.ingest);
app.post('/upload', controllers.upload);
app.use('/static/js', express.static('../..'));

app.listen(config.port, function() {
  console.log('listening at port ' + config.port);
});
