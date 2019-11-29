var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');

var app = express();

app.use(
  serveStatic(path.resolve('./build'), { index: ['index.html', 'index.htm'] })
);

app.get('/*', function(req, res) {
  res.sendFile(path.resolve('./build/index.html'));
});

app.listen(3000);
