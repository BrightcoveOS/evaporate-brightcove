'use strict';

var aws = require('aws-sdk');

var brightcove = require('../brightcove');
var config = require('../config');

module.exports = function ingest(req, res) {
  var { videoId } = req.params;
  var { bucket, objectKey } = req.body;
  var s3 = new aws.S3();
  var signedUrl = s3.getSignedUrl('getObject', {Bucket: bucket, Key: objectKey, Expires: 3600});
  var accountId = config.brightcove.accountId;

  brightcove.post(`https://ingest.api.brightcove.com/v1/accounts/${accountId}/videos/${videoId}/ingest-requests`, {
    master: {
      url: signedUrl,
    },
    profile: 'high-resolution',
  })
  .then((result) => res.json({result}))
  .catch((err) => res.status(500).json({err}));
};
