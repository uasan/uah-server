export function log() {
  console.log('\n<SQL>');
  console.log(this.toString().trim());
  console.log(this.values);
  console.log('</SQL>\n');
  return this;
}
