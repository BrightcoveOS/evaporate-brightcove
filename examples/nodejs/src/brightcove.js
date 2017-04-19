'use strict';

var _ = require('lodash');
var request = require('request');

var config = require('./config');

var authToken = new Buffer(config.brightcove.client.id + ':' + config.brightcove.client.secret).toString('base64');
var accessToken;
var expires = new Date();

function getToken(callback) {
  // Just return the existing token if it is set and not expired, give one less
  // second until considering it expired
  if (accessToken && expires.getTime() > (Date.now() + 1000)) {
    return callback(null, accessToken);
  }

  request.post({
    headers: {
      'Authorization': 'Basic ' + authToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    url: 'https://oauth.brightcove.com/v3/access_token',
    body: 'grant_type=client_credentials'
  }, function(err, res, body) {
    if (err) return callback(err);

    var data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.log('Unable to parse OAuth response', body);
      return callback(e);
    }

    var token = data && data.access_token;
    if (!token) return callback(new Error('Unable to obtain Brightcove OAuth token'));

    accessToken = token;
    if (data.expires_in) {
      expires = new Date(Date.now() + (data.expires_in * 1000));
    }

    callback(null, accessToken);
  });
}

function apiCall(method, url, params) {
  return new Promise(function(resolve, reject) {
    method = method.toLowerCase();

    getToken(function(err, token) {
      if (err) return reject(err);

      var reqParams = {
        url,
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };
      if (method === 'post' || method === 'put') {
        reqParams.json = params;
      } else {
        reqParams.qs = params;
      }

      request[method](reqParams, function(err, res, body) {
        if (err) return reject(err);
        if (!body) return reject(new Error('Empty response'));

        var data;
        if (_.isObject(body)) {
          data = body;
        } else {
          try {
            data = JSON.parse(body);
          } catch (e) {
            console.log('Unable to parse API response', baseUrl, path, body);
            return reject(e);
          }
        }
        resolve(data);
      });
    });
  });
};

module.exports = {
  get: (url, params) => apiCall('GET', url, params),
  post: (url, params) => apiCall('POST', url, params),
};
