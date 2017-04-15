'use strict';

require('dotenv').config();

var _ = require('lodash');

var env = process.env;
var nodeEnv = env.NODE_ENV || 'development';

Error.stackTraceLimit = 50;

var config = {
  app: 'videogram',

  env: nodeEnv,

  server: {
    port: env.PORT || 3000
  },

  logging: {
    level: env.LOGGING_LEVEL || 'debug'
  },

  redis: {
    port: env.REDIS_PORT || 6379,
    host: env.REDIS_HOST || '127.0.0.1',
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB || 0
  },

  brightcove: {
    accountId: env.BRIGHTCOVE_ACCOUNT_ID,
    client: {
      id: env.BRIGHTCOVE_CLIENT_ID,
      secret: env.BRIGHTCOVE_CLIENT_SECRET
    }
  },

  rollbar: {
    enabled: !!env.ROLLBAR_ENABLED,
    token: env.ROLLBAR_TOKEN
  },

  smtp: {
    username: env.SMTP_USERNAME,
    password: env.SMTP_PASSWORD,
    server: {
      host: 'email-smtp.us-east-1.amazonaws.com',
      port: 465,
      secure: true
    }
  },

  cms: {
    mock: false
  },

  aws: {
    region: 'us-west-1',
    bucket: env.AWS_BUCKET,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  }
};

var environments = {
  development: {
    cms: {
      mock: false
    },
  },

  test: {
    logging: {
      level: env.LOGGING_LEVEL || 100
    },

    redis: {
      db: 1
    },

    cms: {
      mock: env.MOCK || false
    }
  },

  qa: {
    logging: {
      level: env.LOGGING_LEVEL || 'info'
    },

    rollar: {
      enabled: true
    }
  },

  stage: {
    logging: {
      level: env.LOGGING_LEVEL || 'info'
    },

    rollbar: {
      enabled: true
    }
  },

  production: {
    logging: {
      level: env.LOGGING_LEVEL || 'info'
    },

    rollbar: {
      enabled: true
    }
  }
};

module.exports = _.merge(config, environments[nodeEnv]);
