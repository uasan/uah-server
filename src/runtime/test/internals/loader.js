import { readdir } from 'fs/promises';
import { root } from '#server/router.js';
import { returnNullArray } from '#utils/native.js';
import { LIST, makeTree } from './tree.js';
import { Test } from './class.js';

const wft = { withFileTypes: true };

const loadFiles = async (promises, path) => {
  for (const dirent of await readdir(path, wft).catch(returnNullArray)) {
    if (dirent.isDirectory())
      promises.push(loadFiles(promises, path + '/' + dirent.name));
    else if (dirent.name.endsWith('.js'))
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      promises.push(import('file://' + path + '/' + dirent.name));
  }
};

const loadAppSubfolder = async (promises, path) => {
  for (const dirent of await readdir(path, wft))
    if (dirent.isDirectory()) {
      promises.push(
        loadFiles(promises, path + '/' + dirent.name + '/api'),
        loadFiles(promises, path + '/' + dirent.name + '/tests')
      );
    }
};

export const loadTests = async () => {
  const promises = [];

  for (const dirent of await readdir(root, wft))
    if (dirent.isDirectory())
      promises.push(loadAppSubfolder(promises, root + '/' + dirent.name));

  for (let i = 0; i < promises.length; i++) await promises[i];

  makeTree();
};

export const loadTest = async (path, name) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const module = await import('file://' + root + '/' + path + '.js');

  const tests = new Set(name ? [module[name]] : Object.values(module));

  for (const test of tests)
    if (test instanceof Test) {
      test.skipped = false;
      for (const parent of test.parent.tests) tests.add(parent);
    }

  for (let i = LIST.length; i--; )
    if (tests.has(LIST[i]) === false) LIST.splice(i, 1);

  makeTree();
};
