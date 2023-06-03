export function groupBy(...params) {
  params = params.filter(Boolean);

  if (params.length) {
    this.source[this.source.length - 1] += '\nGROUP BY ';
    return this.sql(params);
  }
  return this;
}
