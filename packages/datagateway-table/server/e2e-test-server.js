var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');

var app = express();

app.get('/settings.json', function(req, res) {
  res.sendFile(path.resolve('./server/e2e-settings.json'));
});

app.use(
  express.json(),
  serveStatic(path.resolve('./build'), { index: ['index.html', 'index.htm'] })
);

app.get('/*', function(req, res) {
  res.sendFile(path.resolve('./build/index.html'));
});

app.listen(3000);
