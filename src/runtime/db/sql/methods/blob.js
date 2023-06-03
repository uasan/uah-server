import { RESULT_ALL, RESULT_BLOB } from '../constants.js';

export function blob() {
  if (this.result === RESULT_ALL) {
    this.source[0] =
      `SELECT json_build_object('data', (SELECT json_agg(_.*) FROM (` +
      this.source[0];

    this.source[this.source.length - 1] += `) _)) AS "0"`;
  } else {
    this.source[0] =
      `SELECT json_build_object('data', (SELECT to_json(_.*) FROM (` +
      this.source[0];

    this.source[this.source.length - 1] += `) _ LIMIT 1)) AS "0"`;
  }

  this.result = RESULT_BLOB;
  return this;
}
