/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs';
import path from 'path';
import { aliasMap } from './aliases';

const createAliasMap = (jsonData: any) => {
  const mapAliasToComments = new Map();

  Object.keys(jsonData).sort((a: string, b: string) => {
    if (b.length > a.length || b > a) {
      return 1;
    } else if (b < a) {
      return -1;
    }
    return 0;
  }).forEach((key: any) => {
    mapAliasToComments.set(aliasMap.get(key) || key, jsonData[key]['comments']);
  });
  return mapAliasToComments;
}

export const getCounterDataForGen = (genJson: string) => {
  const jsonData = require('../data' + '/' + genJson);
  const aliasMap = createAliasMap(jsonData);
  const pokemonNames = Array.from(aliasMap.keys());
  const pokenamesRegex = new RegExp(pokemonNames.join('|'), 'g');
  const allCounters: Map<string, string[]> = new Map();

  for (const [name, comments] of aliasMap.entries()) {
    if (comments) {
      const countersString = comments.substring(comments.indexOf('Checks and Counters'));
      const counters = Array.from(countersString.matchAll(pokenamesRegex)).map((match) => match[0]);
      const uniqueCounters = [...new Set(counters)];
      allCounters.set(name, uniqueCounters.filter((x) => x !== name))
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
