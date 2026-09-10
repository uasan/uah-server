import { readFileSync } from 'node:fs';

export function getTextFile(path) {
  const { type } = this;
  //const buffer = readFileSync(path);

  return res => {
    res.writeStatus('200');
    res.writeHeader('content-type', type);
    res.end(readFileSync(path));
  };
}
