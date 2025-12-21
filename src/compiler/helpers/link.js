import {
  CWD,
  PATH_BUILD,
  PATH_LIB_TYPES,
  PATH_SRC,
  URL_LIB_RUNTIME,
} from '../../config.js';

export const getDirName = (path, offset) =>
  path.slice(offset, path.indexOf('/', offset));

export const getFilename = path => path.slice(path.lastIndexOf('/') + 1);
export const getExtension = path => path.slice(path.lastIndexOf('.'));
export const capitalize = word => word[0].toUpperCase() + word.slice(1);

export function toRelativeURL(from, to) {
  if (from === to) return '';

  const fromDirs = from.split('/');
  const toDirs = to.split('/');
  const count = fromDirs.length - 1;

  for (let i = 0; i <= count; i++) {
    if (fromDirs[i] !== toDirs[i]) {
      return count === i
        ? './' + toDirs.slice(i).join('/')
        : '../'.repeat(count - i) + toDirs.slice(i).join('/');
    }
  }

  return to;
}

export const toBuildPath = url => PATH_BUILD + url;
export const getTsUrlFromPath = path => path.slice(CWD.length + 1);
export const getUrlFromPath = path => path.slice(PATH_SRC.length, -3) + '.js';

export const toRuntimeUrl = path =>
  URL_LIB_RUNTIME + path.slice(PATH_LIB_TYPES.length, -3) + '.js';
