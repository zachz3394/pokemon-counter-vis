/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs';
import path from 'path';
import { aliasMap } from './aliases';

export const getCounterDataForGen = (genJson: string) => {
  const jsonData = require('../data' + '/' + genJson);
  const pokemonNames = Object.keys(jsonData).map((key: string) => {
    return aliasMap.has(key) ? aliasMap.get(key) : key
  });
  const pokenamesRegex = new RegExp(pokemonNames.join('|'), 'g');
  const allCounters: Map<string, string[]> = new Map();

  for (const key in jsonData) {
    const pokemonName = aliasMap.has(key) ? aliasMap.get(key) : key;

    const comments: string = jsonData[key]['comments'];
    if (comments) {
      const countersString = comments.substring(comments.indexOf('Checks and Counters'));
      const counters = Array.from(countersString.matchAll(pokenamesRegex)).map((match) => match[0]);
      const uniqueCounters = [...new Set(counters)];
      allCounters.set(pokemonName, uniqueCounters.filter((x) => x !== pokemonName))
    }
  }

  for (const name of pokemonNames) {
    if (!allCounters.has(name)) {
      allCounters.set(name, [])
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
