var crypto = require('crypto');

function hmac(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest();
}

function hexhmac(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest('hex');
}

function v4(toSign, timestamp, awsSecretKey, awsRegion, awsService) {
  const date = hmac('AWS4' + awsSecretKey, timestamp);
  const region = hmac(date, awsRegion);
  const service = hmac(region, awsService);
  const signing = hmac(service, 'aws4_request');
  return hexhmac(signing, toSign);
}

module.exports = {
  v4
};
