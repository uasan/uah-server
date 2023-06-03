export function orderBy(...params) {
  params = params.filter(Boolean);

  if (params.length) {
    this.source[this.source.length - 1] += '\nORDER BY ';
    return this.sql(params);
  }
  return this;
}
