var express = require('express');
var path = require('path');
var serveStatic = require('serve-static')

var app = express()

app.get('/settings.json', function (req, res) {
  console.log('getting settings')
  res.sendFile(path.join(__dirname, 'e2e-settings.json'));
});

app.get('/plugins/*', function (req, res) {
  console.log(req.originalUrl.replace('/plugins/', ''))
  res.sendFile(path.join(__dirname, req.originalUrl.replace('/plugins/', '')));
});

app.use(serveStatic(path.resolve('./build'), {'index': ['index.html', 'index.htm']}))

app.get('/*', function (req, res) {
  res.sendFile(path.resolve('./build/index.html'));
});

app.listen(3000)
