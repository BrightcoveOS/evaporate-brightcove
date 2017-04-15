'use strict';

var async = require('async');
var logger = require('../lib/logger')(module);
var redis = require('../lib/redis');
var brightcove = require('./brightcove');

var env = process.env;

function upload(videoName, region, callback) {
  async.waterfall([
    (done) => {
      logger.info('Start video creation in BC api');
      brightcove.createVideo(env.BRIGHTCOVE_ACCOUNT_ID, {
        name: videoName,
        tags: ['videogram']
      }, done);
    },
    (video, done) => {
      logger.info('Create video succeeded!');
      logger.info('Saving proxy bucket awsSecretKey to Redis for future signing');
      const s3Data = {
        secret_access_key: env.AWS_SECRET_ACCESS_KEY,
        bucket: env.AWS_BUCKET,
        object_key: video.id + '/' + videoName,
        access_key_id: env.AWS_ACCESS_KEY_ID,
      };
      logger.info({accessKey: env.AWS_ACCESS_KEY_ID});
      logger.info({s3Data});
      redis.setState(video.id, s3Data.secret_access_key, (err) => {
        done(err, video, s3Data);
      });
    },
  ], (err, video, s3Data) => {
    logger.info('Finished upload ingestion process. Err=', {err});
    callback(err, {
      accountId: env.BRIGHTCOVE_ACCOUNT_ID,
      videoId: video.id,
      bucket: s3Data.bucket,
      awsAccessKeyId: s3Data.access_key_id,
      objectKey: s3Data.object_key,
      region: region,
    });
  });
}

module.exports = {
  upload
};
