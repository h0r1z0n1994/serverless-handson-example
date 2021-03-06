'use strict';
console.log('Loading function');

var fs = require('fs');
var im = require('imagemagick');
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = (event, context, callback) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const params = {
    Bucket: bucket,
    Key: key,
  };
  s3.getObject(params, (err, data) => {
    if (err) {
      console.log(err);
      const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
      console.log(message);
      callback(message);
    } else {
      var contentType = data.ContentType;
      var extension = contentType.split('/').pop();
      console.log(extension);

      im.resize({
        srcData: data.Body,
        format: extension,
        width: 100
      }, function(err, stdout, stderr) {
        if (err) {
          context.done('resize failed', err);
        } else {

          var thumbnailKey = key.split('.')[0] + "-thumbnail." + extension;

          s3.putObject({
            Bucket: bucket,
            Key: thumbnailKey,
            Body: new Buffer(stdout, 'binary'),
            ContentType: contentType
          }, function(err, res) {
            if (err) {
              context.done('error putting object', err);
            } else {
              callback(null, "success putting object");
            }
          });
        }
      });
    }
  });
};