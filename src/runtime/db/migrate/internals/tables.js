export const setTableName = ({ sql }, schema) => {
  schema.tableName = sql(schema.name + '.migrations');
};

export const createTable = async ({ sql }, { tableName }) =>
  await sql`CREATE TABLE IF NOT EXISTS ${tableName} (
    name text COLLATE "C" PRIMARY KEY,
    hash text,
    updated_at timestamptz not null default CURRENT_TIMESTAMP,
    created_at timestamptz not null default CURRENT_TIMESTAMP
  )`;

export const saveTable = ({ sql }, { command, schemas, files }) => {
  const queries = [];

  for (const schema of schemas) {
    const list = files.filter(file => file.schema === schema);

    if (list.length) {
      if (command === 'up') {
        const names = list.map(file => file.name);
        const hashes = list.map(file => file.hash || null);

        queries.push(sql`
          INSERT INTO ${schema.tableName}(name, hash)
            SELECT * FROM unnest(${names}::text[], ${hashes}::text[])
            ON CONFLICT(name) DO UPDATE SET hash = EXCLUDED.hash, updated_at = DEFAULT`);
      } else {
        queries.push(sql`
        DELETE FROM ${schema.tableName}
          WHERE name = ANY(${list.map(file => file.name)}::text[])`);
      }
    }
  }

  if (queries.length === 1) {
    return queries[0];
  } else {
    const query = sql`WITH `;

    for (let i = 1; i < queries.length; i++) {
      const { source, values } = queries[i];

      source[0] = (i === 1 ? `_${i} AS(` : `,_${i} AS(`) + source[0];

      source[source.length - 1] += ')';
      query.sql(source, ...values);
    }

    query.sql(queries[0].source, ...queries[0].values);

    return query;
  }
};
