export function help() {
  console.log(`These are common Migrate commands:
  npm run migrate up               Run up method for all new and updated migrations
  npm run migrate down [filename]  Run down method of [filename]
  npm run migrate status           Check status of migrations table`);
}
