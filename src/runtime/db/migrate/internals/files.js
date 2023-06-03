import { resolve } from 'path';
import { createHmac } from 'crypto';
import { readdir, readFile } from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';
import { CWD } from '#utils/location.js';
import { execBatchSQL } from '#db/helpers.js';
import {
  FOLDER_NAME,
  STATUS_NEW,
  STATUS_DONE,
  STATUS_UPDATED,
} from '../constants.js';

export const files = [];
export const indexes = new Map();
export const getHash = data => createHmac('sha256', data).digest('base64url');
export const setStatusByHash = (file, hash) => {
  file.status =
    file.hash == hash
      ? STATUS_DONE
      : file.wasDone
      ? STATUS_UPDATED
      : STATUS_NEW;

  file.hash = hash;
};

export const getFolderPath = (name, isApplication) =>
  isApplication
    ? CWD + '/src/' + FOLDER_NAME
    : resolve(
        fileURLToPath(import.meta.url),
        '../../../../../src/' + FOLDER_NAME + '/' + name
      );

const filterImportFiles = file => (file.module ? indexes.has(file.url) : true);

const sortByDependencies = ({ index: a }, { index: b }) =>
  a > b ? 1 : a < b ? -1 : 0;

const loadFileSQL = async file => {
  const data = await readFile(fileURLToPath(file.url), 'utf8');
  setStatusByHash(file, getHash(data));

  file.up = context => execBatchSQL(context, data);
  file.down = context => execBatchSQL(context, data, 'DROP');
  file.index = Infinity;
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
const importFile = file => file.module && import(file.url);
const getBaseName = name => name.slice(0, name.lastIndexOf('.')).toLowerCase();

const loadFolder = async (promises, schema, base) => {
  const { names, folders } = schema;

  for (const dirent of await readdir(base.path, { withFileTypes: true })) {
    if (dirent.isDirectory()) {
      let meta = null;
      const name = base.name + dirent.name + '/';

      for (let i = 0; i < folders.length; i++)
        if (name.startsWith(folders[i].prefix)) {
          meta = folders[i].params;
          break;
        }

      promises.push(
        loadFolder(promises, schema, {
          meta,
          name,
          path: base.path + dirent.name + '/',
        })
      );
    } else {
      const isFileJS = dirent.name.endsWith('.js');
      const isFileSQL = dirent.name.endsWith('.sql');

      if (!isFileJS && !isFileSQL) {
        continue;
      }

      let file;
      const name = base.name + getBaseName(dirent.name);
      const url = pathToFileURL(base.path + dirent.name).href;

      if (names.has(name)) {
        file = names.get(name);

        if (file.url) {
          throw new Error(`Duplicate file name ${name}`);
        }

        file.url = url;
        file.status = STATUS_DONE;
      } else {
        file = {
          name,
          url,
          schema,
          skip: false,
          wasDone: false,
          status: STATUS_NEW,
        };

        names.set(name, file);
      }

      if (isFileSQL) {
        promises.push(loadFileSQL(file));
      } else {
        file.module = true;
      }

      if (base.meta !== null) {
        Object.assign(file, base.meta);
      }

      files.push(file);
    }
  }
};

export const setFiles = async payload => {
  const promises = [];

  for (const schema of payload.schemas)
    for (const path of schema.paths)
      promises.push(
        loadFolder(promises, schema, { meta: null, name: '', path: path + '/' })
      );

  for (let i = 0; i < promises.length; i++) await promises[i];

  await Promise.all(files.map(importFile));
  payload.files = files.filter(filterImportFiles).sort(sortByDependencies);
};
