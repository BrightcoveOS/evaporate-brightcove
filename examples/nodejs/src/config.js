'use strict';

require('dotenv').config();

Error.stackTraceLimit = 50;

var config = {
  port: process.env.PORT || 3000,

  brightcove: {
    accountId: process.env.BRIGHTCOVE_ACCOUNT_ID,
    client: {
      id: process.env.BRIGHTCOVE_CLIENT_ID,
      secret: process.env.BRIGHTCOVE_CLIENT_SECRET
    }
  },

  aws: {
    region: 'us-west-1',
    bucket: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

module.exports = config;
