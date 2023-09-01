export async function migrate(context, migrations) {
  console.log('MIGRATIONS', migrations);
  console.log(await context.prototype.sql`SELECT 1`);
}
