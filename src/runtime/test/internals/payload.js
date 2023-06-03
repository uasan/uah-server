import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const types = {
  csv: 'text/csv',
  tsv: 'text/tsv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const file = ({ url }, path, options) => {
  path = resolve(fileURLToPath(url.slice(0, url.lastIndexOf('/'))), path);

  const buffer = readFileSync(path, options);
  const name = path.slice(path.lastIndexOf('/') + 1);
  const size = buffer.byteLength ?? buffer.length;
  const type = types[path.slice(path.lastIndexOf('.') + 1)] ?? '';

  return { buffer, size, type, name, path };
};
