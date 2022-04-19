/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs';
import path from 'path'

export const getCounterDataForGen = (genJson: string) => {
  const jsonData = require('../data' + '/' + genJson);
  const pokenamesRegex = new RegExp(Object.keys(jsonData).join('|'), 'g');
  const allCounters: Map<string, string[]> = new Map();

  for (const key in jsonData) {
    const comments: string = jsonData[key]['comments'];
    if (comments) {
      const countersString = comments.substring(comments.indexOf('Checks and Counters'));
      const counters = Array.from(countersString.matchAll(pokenamesRegex)).map((match) => match[0]);
      const uniqueCounters = [...new Set(counters)];
      allCounters.set(key, uniqueCounters.filter((x) => x !== key))
    }
  }

  return allCounters;
}

export const getAllCounterData = () => {
  const dir = path.join(__dirname, '../data');
  const genCounterData: Map<string, Map<string, string[]>> = new Map();

  for (const filename of fs.readdirSync(dir)) {
    const allCounters = getCounterDataForGen(filename)

    genCounterData.set(path.parse(filename).name, allCounters);
  }

  return genCounterData;
}

console.log(getAllCounterData());