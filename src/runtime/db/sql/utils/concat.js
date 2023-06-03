export const concat = (sql, strings, params) => {
  let i = sql.source.length - 1;

  sql.source[i] += strings[0];
  for (i = 0; i < params.length; i) sql.set(params[i], strings[++i]);
};

export const injection = (sql, strings, separator = ', ') => {
  let s = '';

  for (let i = 0; strings.length > i; i++) {
    const string = strings[i];

    if (string === undefined || string === '') continue;
    let c = sql.source.length - 1;

    if (sql.sql === string?.sql) {
      sql.values.push(...string.values);
      sql.source[c] += s + string.source[0];
      sql.source.push(...string.source.slice(1));
    } else sql.source[c] += s + string;

    s = separator;
  }
};

export const join = (sql, start, queries, separator) => {
  if (queries.length) {
    let c = 0;
    let n = sql.source.length - 1;

    sql.source[n] += start;

    do {
      const { source, values } = queries[c];
      sql.source[n] += source[0];

      for (let i = 0; i < values.length; i) sql.set(values[i], source[++i]);
      n = sql.source.length - 1;
    } while (++c < queries.length && (sql.source[n] += separator));
  }

  return sql;
};
