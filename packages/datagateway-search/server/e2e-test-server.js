var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var axios = require('axios');
var fs = require('fs')

var app = express();

app.use(
  express.json(),
  serveStatic(path.resolve('./build'), { index: ['index.html', 'index.htm'] })
);

app.get('/datagateway-search-settings.json', function(req, res) {
  res.sendFile(path.resolve('./server/e2e-settings.json'));
});

app.get(/\/sessions|investigations|datasets|datafiles/, function(req, res) {
  fs.readFile('server/e2e-settings.json').then((settings) => {
    axios
    .get(settings.apiUrl + req.url, {
      headers: req.headers,
    })
    .then(apiRes => {
      res.json(apiRes.data);
    })
    .catch(error => {
      res.status(error.response.status).end();
    });
  });
});

app.post(/\/sessions|investigations|datasets|datafiles/, function(req, res) {
  fs.readFile('server/e2e-settings.json').then((settings) => {
    axios
      .post(settings.apiUrl + req.url, req.body, {
        headers: req.headers,
      })
      .then(apiRes => {
        res.json(apiRes.data);
      })
      .catch(error => {
        res.status(error.response.status).end();
      });
  });
});

app.get('/*', function(req, res) {
  res.sendFile(path.resolve('./build/index.html'));
});

app.listen(3000);
