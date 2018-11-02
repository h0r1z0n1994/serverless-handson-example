const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const docClient = new AWS.DynamoDB.DocumentClient({region: 'ap-northeast-1'});  // 追記

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify('Hello from Lambda!')
  };

  const body = JSON.parse(event.body);
  const fileData = body.content.replace(/^data:\w+\/\w+;base64,/, '');

  const s3Params = {
    Bucket: 'horizono.yoshihiro.seminar',
    Key: `img/${event.requestContext.requestId}.jpg`,
    Body: new Buffer(fileData, 'base64'),
    ContentType: 'image/jpeg'
  };

  const item = {
    requestId: event.requestContext.requestId,
    title: body.title,
    comment: body.comment,
    contributor:body.contributor
  };

  const dynamoParams = {
    TableName: 'message_horizono',
    Item: item
  };

  await s3.putObject(s3Params).promise();
  await docClient.put(dynamoParams).promise();

  return response;
};