/* eslint-env browser */

var Evaporate = require('evaporate');
var AWS = require('aws-sdk');

// Public API
// - file: a File object from a file input
// - uploadUrl: creates BC video id and returns it along with s3 bucket, public key, & object_key
// - signerUrl: signs each part of the multipart upload, conforms to EvaporateJS signerUrl
// - ingestUrl: url to hit on your server when s3 upload is finished to trigger DI job
// - returns a promise
function uploadVideo(file, uploadUrl, signerUrl, ingestUrl) { // eslint-disable-line no-unused-vars
  var bucket, objectKey, videoId, accountId;

  return startBrightcoveDI(uploadUrl, file.name)
    .then(function(response) {
      bucket = response.bucket;
      objectKey = response.objectKey;
      videoId = response.videoId;
      accountId = response.accountId;

      return startS3Upload({
        awsAccessKeyId: response.awsAccessKeyId,
        region: 'us-west-1',
        videoId: videoId,
        bucket: bucket,
        objectKey: objectKey,
        signerUrl: signerUrl,
        file: file,
      });
    })
    .then(function () {
      return ingestAsset({
        ingestUrl: ingestUrl,
        bucket: bucket,
        objectKey: objectKey,
        videoId: videoId,
      });
    })
    .then(function () {
      return embedPlayer(accountId, videoId);
    });
}

function startBrightcoveDI(uploadUrl, fileName) {
  return new Promise(function(resolve, reject) {
    return postJson(uploadUrl, {name: fileName})
      .then(resolve)
      .catch(reject);
  });
}

function startS3Upload(config) {
  return new Promise(function(resolve, reject) {
    Evaporate.create({
      signerUrl: config.signerUrl + '/' + config.videoId,
      aws_key: config.awsAccessKeyId,
      awsRegion: config.region,
      bucket: config.bucket,
      awsSignatureVersion: '4',
      computeContentMd5: true,
      cryptoMd5Method: function (data) { return AWS.util.crypto.md5(data, 'base64'); },
      cryptoHexEncodedHash256: function (data) { return AWS.util.crypto.sha256(data, 'hex'); }
    })
    .then(function (evap) {
      return evap.add({
        name: config.objectKey,
        file: config.file,
        error: config.onError,
        started: config.onStarted,
        complete: config.onComplete,
        uploadInitiated: config.onUploadInitiated,
        progress: config.onProgress,
      });
    })
    .then(resolve)
    .catch(reject);
  });
}

function ingestAsset(config) {
  var ingestUrl = config.ingestUrl + '/' + config.videoId;
  return postJson(ingestUrl, {
    bucket: config.bucket,
    objectKey: config.objectKey,
  });
}

function embedPlayer(accountId, videoId) {
  return new Promise(function (resolve) {
    var iframe = document.createElement('div');
    iframe.innerHTML = '<iframe src="//players.brightcove.net/' + accountId + '/default_default/index.html?videoId=' + videoId + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>';
    iframe.innerHTML += '<code>&lt;iframe src="//players.brightcove.net/' + accountId + '/default_default/index.html?videoId=' + videoId + '" allowfullscreen webkitallowfullscreen mozallowfullscreen&gt;&lt;/iframe&gt;';
    iframe.innerHTML += '<a href="//players.brightcove.net/' + accountId + '/default_default/index.html?videoId=' + videoId + '">View in Player</a>';
    document.getElementsByTagName('body')[0].appendChild(iframe);
    resolve();
  });
}

function postJson(url, body) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(JSON.parse(this.response));
        } else {
          reject(this);
        }
      }
    };
    xhr.send(JSON.stringify(body));
  });
}

module.exports = uploadVideo;
