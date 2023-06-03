export const getAllKeys = values => [
  ...new Set(values.map(Object.keys).flat()),
];
export class SetSQL {
  sql = null;
  startWith = '';
  separator = '';
  isStarted = false;

  constructor(sql, { startWith, separator }) {
    this.sql = sql;
    this.startWith = startWith;
    this.separator = separator;
  }

  set(startString, value, endString = '') {
    const { source } = this.sql;
    const lastIndex = source.length - 1;

    if (this.isStarted) {
      source[lastIndex] += this.separator + startString;
    } else {
      this.isStarted = true;
      source[lastIndex] += this.startWith + startString;
    }

    if (value !== undefined) {
      this.sql.set(value, endString);
    }
  }
}
