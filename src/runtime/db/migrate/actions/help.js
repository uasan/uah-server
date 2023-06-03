import { bold } from '#utils/console.js';

import { getSchemas } from '../internals/schemas.js';

const readMeUrl =
  'https://github.com/HRForecast/NodeJS-smartAPI/blob/master/docs/MIGRATE.md';

export const help = () => {
  const schemas = getSchemas();

  console.log(`usage: npm run migrate [command] [schema] [file_name]
  
  These are common Migrate commands used in various situations:

    ${bold('up')}:

      up                           Run migrations for current schema
      up [schema]                  Run migrations for [schema]
      up [schema] [file_name]      Run migrations for [schema] [file_name]

    ${bold('down')}:
    
      down [schema] [file_name]    Run migrations for [file_name]

    ${bold('status')}:

      status                       Check status of migrations table
      status [schema]              Check status of migrations table for [schema]

    ${bold('rollback')}:

      rollback [schema]            Rollback [schema]
      rollback all schemas         Rollback all schemas that are dependent on current


  Schema dependencies: ${schemas.map(({ name }) => name).join(', ')}.

  ENV variables:
    DB_PORT,
    DB_HOST,
    DB_NAME,
    MASTER_DB_USER,
    MASTER_DB_PASS,
    ${schemas
      .reduce((acc, { name, isCurrent }) => {
        const prefix = name.toUpperCase();
        const user = `${prefix}_DB_USER`;
        const pass = `${prefix}_DB_PASS`;

        [user, pass].map(val => acc.push(isCurrent ? bold(val) : val));

        return acc;
      }, [])
      .join(',\n    ')}
  
  More detailed description you can find via this link:
  ${readMeUrl}
  
  'npm run migrate help' list available subcommands and some concept guides.`);
};
