/* eslint-env mocha */

describe('crypto compatibility', function() {
  describe('md5/base64', function() {
    ['AWSEXAMPLE1232', 'foobar', '129387123(*&6724;'].forEach(function(input) {
      var expected = AWS.util.crypto.md5(input, 'base64');
      var actual = BCUploader.md5(input);

      expect(actual).to.equal(expected);
    });
  });

  describe('sha256/hex', function() {
    ['AWSEXAMPLE1232', 'foobar', '129387123(*&6724;'].forEach(function(input) {
      var expected = AWS.util.crypto.sha256(input, 'hex');
      var actual = BCUploader.sha256(input);

      expect(actual).to.equal(expected);
    });
  });
});
