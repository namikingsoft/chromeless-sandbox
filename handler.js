'use strict';

const axios = require('axios');
const { Chromeless } = require('chromeless');
const {
  CHROMELESS_ENDPOINT,
  CHROMELESS_APIKEY,
} = process.env;

module.exports.chrome = (event, context, callback) => {
  const chromeless = new Chromeless({
    remote: {
      endpointUrl: CHROMELESS_ENDPOINT,
      apiKey: CHROMELESS_APIKEY,
    },
  });
  chromeless
  .goto('https://www.google.com')
  .type('chromeless', 'input[name="q"]')
  .press(13)
  .wait('#resultStats')
  .goto('http://inet-ip.info')
  .screenshot()
  .then(path => chromeless.end().then(() => path))
  .then(data => {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Go Serverless v1.0! Your function executed successfully!',
        data,
      }),
    });
  })
  .catch(err => {
    console.error(err);
    callback(err);
  });
};

module.exports.axios = (event, context, callback) => {
  axios.get('http://httpbin.org/ip')
  .then(res => {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Go Serverless v1.0! Your function executed successfully!',
        data: res.data,
      }),
    });
  })
  .catch(err => {
    console.error(err);
    callback(err);
  });
};
