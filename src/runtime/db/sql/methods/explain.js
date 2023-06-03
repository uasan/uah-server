export async function explain(isAll = false) {
  const { sql } = this.context;

  const [{ 'QUERY PLAN': plans }] = await sql(
    [
      'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' + this.source[0],
      ...this.source.slice(1),
    ],
    ...this.values
  );

  if (isAll) {
    const { url } = await fetch('https://explain-postgresql.com/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        private: true,
        plan: JSON.stringify(plans[0]),
        query: this.toString().trim(),
      }),
    });

    console.log('Explain: ', url + '#context');
  } else {
    console.log('<EXPLAIN>\n');
    console.log('\tCost:', plans[0].Plan['Total Cost']);
    console.log('\tTime:', plans[0]['Execution Time'], 'ms');
    console.log('\n</EXPLAIN>');
  }

  return await this;
}
