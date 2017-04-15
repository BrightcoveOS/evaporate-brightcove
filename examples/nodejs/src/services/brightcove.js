'use strict';

var _ = require('lodash');
var config = require('../config');
var logger = require('../lib/logger')(module);
var request = require('request');

var playersResponse;
var videosResponse;
var videoByIdResponse;
if (config.cms.mock) {
  playersResponse = require('../../resources/cms/players.json');
  videosResponse = require('../../resources/cms/videos.json');
  videoByIdResponse = videosResponse[0];
}

var AUTH_URL = 'https://oauth.brightcove.com/v3';
var CMS_URL = 'https://cms.api.brightcove.com/v1/accounts/';
var DI_URL = 'https://ingest.api.brightcove.com/v1/accounts/';

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
    url: AUTH_URL + '/access_token',
    body: 'grant_type=client_credentials'
  }, function(err, res, body) {
    if (err) {
      return callback(err);
    }
    var data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      logger.error('Unable to parse OAuth response', body);
      return callback(e);
    }

    var token = data && data.access_token;
    if (!token) {
      return callback(new Error('Unable to obtain Brightcove OAuth token'));
    }
    accessToken = token;
    if (data.expires_in) {
      expires = new Date(Date.now() + (data.expires_in * 1000));
    }

    callback(null, accessToken);
  });
}

function mockApiCall(bcAccountId, method, baseUrl, path, params, callback) {
  if (method.toUpperCase() !== 'GET') {
    return callback(null, {});
  }
  if (path === '/players') {
    return callback(null, playersResponse);
  }
  if (path === '/videos') {
    return callback(null, videosResponse);
  }
  if (path.indexOf('/videos/') === 0) {
    var videoId = path.split('/').pop();
    var video = _.find(videosResponse, {
      id: videoId
    });
    return callback(null, video ? video : videoByIdResponse);
  }
  callback(null, {});
}

function apiCall(bcAccountId, method, baseUrl, path, params, callback) {
  method = method.toLowerCase();
  method = method === 'delete' ? 'del' : method;

  if (config.cms.mock) {
    return mockApiCall(bcAccountId, method, baseUrl, path, params, callback);
  }

  getToken(function(err, token) {
    if (err) {
      return callback(err);
    }
    var reqParams = {
      url: baseUrl + bcAccountId + path,
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
      if (err) {
        return callback(err);
      }
      if (!body) {
        return callback(null, null);
      }
      var data;
      if (_.isObject(body)) {
        data = body;
      } else {
        try {
          data = JSON.parse(body);
        } catch (e) {
          logger.error('Unable to parse API response', baseUrl, path, body);
          return callback(e);
        }
      }
      callback(null, data);
    });
  });
}

function getVideoById(bcAccountId, videoId, callback) {
  apiCall(bcAccountId, 'GET', CMS_URL, '/videos/' + videoId, null, callback);
}

function createVideo(bcAccountId, metadata, callback) {
  apiCall(bcAccountId, 'POST', CMS_URL, '/videos', metadata, callback);
}

function ingest(bcAccountId, videoId, body, callback) {
  apiCall(bcAccountId, 'POST', DI_URL, `/videos/${videoId}/ingest-requests`, body, callback);
}

function getUploadUrl(bcAccount, videoId, sourceName, callback) {
  var encodedSourceName = encodeURIComponent(sourceName);
  apiCall(bcAccount, 'GET', DI_URL, `/videos/${videoId}/upload-urls/${encodedSourceName}`, null, callback);
}

module.exports = {
  getVideoById,
  createVideo,
  ingest,
  getUploadUrl
};
