import express from 'express';
import { getCounterDataForGen } from './readCounters';

const app = express();
const port = 8000;

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.get('/gens/:gen', (req, res) => {
  const genJson = req.params['gen'] + '.json';
  console.log('Fetching ' + genJson);
  const response = JSON.stringify([...getCounterDataForGen(genJson)]);
  res.send(response);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
