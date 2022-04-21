import express from 'express';
import { getCounterDataForGen } from './readCounters';
import cors from 'cors';

const app = express();
app.use(cors());
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
