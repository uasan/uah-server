import { getTextFile } from './handlers.js';

export const types = {
  html: {
    init: getTextFile,
    type: 'text/html; charset=utf-8',
  },
  css: {
    init: getTextFile,
    type: 'text/css',
  },
  js: {
    init: getTextFile,
    type: 'text/javascript',
  },
  svg: {
    init: getTextFile,
    type: 'image/svg+xml',
  },
};
