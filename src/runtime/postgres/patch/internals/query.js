export function makeQuery({ queries }) {
  if (queries.length === 1) {
    return queries[0];
  }

  let cte = '';
  let select = '';

  for (let i = 0; i < queries.length; i++) {
    if (cte) {
      cte += ',\n';
      select += '\nUNION\n';
    } else {
      cte = 'WITH ';
    }

    cte += '"' + i + '" AS (\n' + queries[i] + ')';
    select += 'SELECT * FROM "' + i + '"';
  }

  console.log(cte + '\n' + select);
  return cte + '\n' + select;
}
