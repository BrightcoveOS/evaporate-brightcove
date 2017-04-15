'use strict';

var async = require('async');
var logger = require('../lib/logger')(module);
var redis = require('../lib/redis');
var brightcove = require('./brightcove');

var env = process.env;

function upload(videoName, callback) {
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
      logger.info('Get upload URL for video from BC API');
      brightcove.getUploadUrl(
        env.BRIGHTCOVE_ACCOUNT_ID,
        video.id,
        videoName,
        (err, s3Data) => {
          done(err, video, s3Data);
        }
      );
    },
    (video, s3Data, done) => {
      logger.info('Saving awsSecretKey to Redis for future signing');
      redis.setState(video.id, s3Data.secret_access_key, (err) => {
        done(err, video, s3Data);
      });
    },
  ], (err, video, s3Data) => {
    logger.info('Finished upload ingestion process. Err=', {err});
    callback(err, {
      videoId: video.id,
      bucket: s3Data.bucket,
      awsAccessKeyId: s3Data.access_key_id,
      objectKey: s3Data.object_key,
    });
  });
}

module.exports = {
  upload
};
