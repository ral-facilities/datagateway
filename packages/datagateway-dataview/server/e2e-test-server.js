import express from 'express';
import path from 'path';

const app = express();

app.get('/datagateway-dataview-settings.json', function (req, res) {
  // detect if the E2E test is running inside CI
  // If so, use the settings file specific to E2E
  // Otherwise, use the same settings file that is also for running the app normally (yarn start etc).
  const isCiEnv = process.env.CI;
  res.sendFile(
    path.resolve(
      isCiEnv
        ? './server/e2e-settings.json'
        : './public/datagateway-dataview-settings.json'
    )
  );
});

app.get('/bioportal/*', async function (req, res) {
  const newUrl =
    'https://data.bioontology.org' + req.url.replace(/^\/bioportal/, '');
  const newReq = new Request(newUrl, {
    headers: {
      ...req.headers,
      referer: '',
      authorization: `apikey token=${process.env.VITE_BIOPORTAL_API_KEY}`,
    },
  });

  const response = await fetch(newReq);
  const responseJson = await response.json();
  res.send(responseJson);
});

app.use(
  express.json(),
  express.static(path.resolve('./dist'), {
    index: ['index.html', 'index.htm'],
  })
);

app.get('/*', function (req, res) {
  res.sendFile(path.resolve('./dist/index.html'));
});

app.listen(3000);
