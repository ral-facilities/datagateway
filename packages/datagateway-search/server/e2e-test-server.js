var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var axios = require('axios');

var app = express();

app.use(
  express.json(),
  serveStatic(path.resolve('./build'), { index: ['index.html', 'index.htm'] })
);

app.get(/\/sessions|investigations|datasets|datafiles/, function(req, res) {
  axios
    .get('http://scigateway-preprod.esc.rl.ac.uk:5000' + req.url, {
      headers: req.headers,
    })
    .then(apiRes => {
      res.json(apiRes.data);
    })
    .catch(error => {
      res.status(error.response.status).end();
    });
});

app.post(/\/sessions|investigations|datasets|datafiles/, function(req, res) {
  axios
    .post('http://scigateway-preprod.esc.rl.ac.uk:5000' + req.url, req.body, {
      headers: req.headers,
    })
    .then(apiRes => {
      res.json(apiRes.data);
    })
    .catch(error => {
      res.status(error.response.status).end();
    });
});

app.get('/*', function(req, res) {
  res.sendFile(path.resolve('./build/index.html'));
});

app.listen(3000);
