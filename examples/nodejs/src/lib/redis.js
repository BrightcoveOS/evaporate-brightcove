'use strict';

var config = require('../config');
var logger = require('../lib/logger')(module);

var redis;
if (process.env.MOCK_REDIS) {
  redis = require('fakeredis');
} else {
  redis = require('redis');
}

function create(options) {
  logger.info('Connecting to redis');
  var client = redis.createClient(options.port, options.host);

  client.on('ready', function () {
    if (options.password) {
      client.auth(options.password, function(err) {
        if (err) {
          throw err;
        }
      });
    }
    client.select(options.db || 0, function(err) {
      if (err) {
        throw err;
      }
    });
    client.on('error', function (err) {
      logger.error('Redis error', err);
    });
    logger.info('Connected to redis');
  });

  return client;
}

var client = create(config.redis);

function getState(videoId, callback) {
  client.hget('state', videoId, function(err, awsSecretKey) {
    if (err) {
      return callback(err);
    }
    if (!awsSecretKey) {
      return callback(new Error('No AWS secret key for video id'));
    }
    callback(null, awsSecretKey);
  });
}

function setState(videoId, awsSecretKey, callback) {
  logger.info('Saving secret key ' + awsSecretKey + ' to redis for ' + videoId);
  client.hset('state', videoId, awsSecretKey, callback);
}

module.exports = {
  create,
  setState,
  getState,
};
