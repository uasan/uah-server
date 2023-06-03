import { ERROR_FORMATTED, ERROR_REPORTED } from '#utils/native.js';
import { red, blue, bold } from '#utils/console.js';
import { CODES } from '#db/constants.js';

import { Timeout } from '#exceptions/Timeout.js';
import { Conflict } from '#exceptions/Conflict.js';
import { Forbidden } from '#exceptions/Forbidden.js';
import { Unavailable } from '#exceptions/Unavailable.js';
import { UnProcessable } from '#exceptions/UnProcessable.js';

const filterSource = line => line.includes('file:///');

const exceptions = {
  ECONNREFUSED: Unavailable,
  CONNECTION_CLOSED: Unavailable,
  CONNECTION_DESTROYED: Timeout,
  CONNECT_TIMEOUT: Timeout,

  [CODES.INSUFFICIENT_PRIVILEGE]: Forbidden,

  [CODES.UNIQUE_VIOLATION]: Conflict,
  [CODES.RESTRICT_VIOLATION]: Conflict,
  [CODES.FOREIGN_KEY_VIOLATION]: Conflict,
  [CODES.INTEGRITY_CONSTRAINT_VIOLATION]: Conflict,

  [CODES.CHECK_VIOLATION]: UnProcessable,
  [CODES.NOT_NULL_VIOLATION]: UnProcessable,
  [CODES.INVALID_DATETIME_FORMAT]: UnProcessable,
  [CODES.DATETIME_FIELD_OVERFLOW]: UnProcessable,
  [CODES.NUMERIC_VALUE_OUT_OF_RANGE]: UnProcessable,
  [CODES.INVALID_TEXT_REPRESENTATION]: UnProcessable,
  [CODES.INVALID_BINARY_REPRESENTATION]: UnProcessable,
};

export const makeError = e => {
  if (e?.code) {
    e[ERROR_REPORTED] = true;

    let { message } = e;
    const error = new (exceptions[e.code] ?? Error)(message);

    error[ERROR_FORMATTED] = true;

    message = red(bold('DB Error')) + '\n' + message;

    if (e.detail) message += '\n' + e.detail;
    if (e.where) message += '\n' + e.where;
    if (e.hint) message += '\n' + e.hint;

    if (e.position && e.query) {
      let max = 60;

      let left = e.query
        .slice(0, e.position - 1)
        .replace(/\s+/g, ' ')
        .trimLeft();

      let right = e.query
        .slice(e.position - 1)
        .replace(/\s+/g, ' ')
        .trimRight();

      if (left.length > max) {
        const chunk = left.slice(0, left.length - max);
        left = left.slice(chunk.lastIndexOf(' ') + 1);
      }
      if (right.length > max) {
        const chunk = right.slice(max);
        right = right.slice(0, max + chunk.indexOf(' '));
      }

      let length = right.indexOf(' ') > 0 ? right.indexOf(' ') : right.length;

      message += '\n' + left + right;
      message += '\n' + ' '.repeat(left.length) + bold(red('^'.repeat(length)));
    }

    error.code = e.code;
    error.stack =
      message +
      '\n' +
      blue(error.stack.split('\n').filter(filterSource).slice(2).join('\n'));

    if (e.constraint_name) error.constraint = e.constraint_name;

    return error;
  } else {
    return e;
  }
};
