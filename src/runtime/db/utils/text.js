export const quoteLiteral = value =>
  value == null ? 'NULL' : "'" + String(value).replaceAll("'", "''") + "'";

export const inlineSQL = async query => {
  if (!query.values?.length) {
    return query.toString();
  }

  const { source, values } = query;
  const { db } = query.context;
  const { serializers } = db.options;

  let sql = source[0];
  const { types } = await db.unsafe(query.toString(), values).describe();

  for (let i = 0; i < types.length; i++) {
    const serialize = serializers[types[i]] ?? String;
    sql += quoteLiteral(serialize(values[i])) + source[i + 1];
  }

  return sql;
};
