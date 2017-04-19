'use strict';

var brightcove = require('../brightcove');
var config = require('../config');

module.exports = function uploadHandler(req, res) {
  var videoName = req.body.name;
  var accountId = config.brightcove.accountId;

  console.log('Starting new upload:', JSON.stringify(req.body));

  brightcove.post(`https://cms.api.brightcove.com/v1/accounts/${accountId}/videos`, {
    name: videoName,
  })
  .then(function(video) {
    console.log('Create video succeeded!');
    res.status(200).json({
      accountId: config.brightcove.accountId,
      videoId: video.id,
      bucket: config.aws.bucket,
      awsAccessKeyId: config.aws.accessKeyId,
      objectKey: video.id + '/' + videoName,
      region: config.aws.region,
    });
  })
  .catch((err) => {
    console.error(err);
    return res.status(500).send(err.message);
  });
}
