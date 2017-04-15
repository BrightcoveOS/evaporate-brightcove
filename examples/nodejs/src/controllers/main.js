'use strict';

var services = require('../services');
var logger = require('../lib/logger')(module);
var redis = require('../lib/redis');
var aws = require('aws-sdk');
const region = 'us-west-1';

function index(req, res) {
  res.render('index');
}

function ingest(req, res) {
  var { videoId } = req.params;
  var { bucket, objectKey } = req.body;
  var s3 = new aws.S3();
  var signedUrl = s3.getSignedUrl('getObject', {Bucket: bucket, Key: objectKey, Expires: 3600});

  services.brightcove.ingest(process.env.BRIGHTCOVE_ACCOUNT_ID, videoId, {
    master: {
      url: signedUrl,
    },
    profile: 'high-resolution',
  }, (err, result) => {
    if (err) {
      return res.status(500).json({err});
    }

    res.json({result});
  });
}

function sign(req, res) {
  logger.info(`Signing string '${req.query.to_sign}' with aws v4 signature algorithm`);
  var {videoId} = req.params;
  var {to_sign, datetime} = req.query;

  logger.info('Signing parameters:', {videoId, datetime, region});

  // TODO - validate all input (at least the presence of it, especially videoId

  redis.getState(videoId, (err, awsSecretKey) => {
    if (err) {
      return res.status(500).json({err});
    }

    res.send(services.signer.v4(
      to_sign,
      datetime.slice(0,8),
      awsSecretKey,
      region,
      's3'
      ));
  });
}

function upload(req, res) {
  logger.info('Starting new upload:', JSON.stringify(req.body));

  const S3MODE = 'proxy';

  services[S3MODE].upload(req.body.name, region, (err, data) => {
    if (err) {
      logger.error(err);
      return res.status(500).send(err.message);
    }

    logger.info('Success creating new video upload!', data);
    res.status(200).json(data);
  });
}

module.exports = {
  index,
  sign,
  upload,
  ingest,
};
