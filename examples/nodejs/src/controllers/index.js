'use strict';

function index(req, res) {
  res.sendFile('index.html', {
    root: __dirname + '/../../public/'
  });
}

module.exports = {
  index: index,
  ingest: require('./ingest'),
  sign: require('./sign'),
  upload: require('./upload'),
};
