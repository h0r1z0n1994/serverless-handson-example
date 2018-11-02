const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const res ={
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": null
  };

  let body = JSON.parse(event.body);
  const fileData = body.content.replace(/^data:\w+\/\w+;base64,/, '');
  let s3Params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `img/post/${event.requestContext.requestId}.png`,
    Body: new Buffer(fileData, 'base64'),
    ContentType: 'image/jpeg'
  };
  await s3.putObject(s3Params).promise();

  return res;
};
