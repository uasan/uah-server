import { STATUS_SKIPED } from '../constants.js';

export const status = async (context, { files }) => {
  files = files.map(({ schema, name, skip, status }) => ({
    schema: schema.name,
    name,
    status: skip ? STATUS_SKIPED : status,
  }));

  console.table(files);
};
