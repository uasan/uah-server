import { green } from '#utils/console.js';
import { runFiles } from '../internals/actions.js';
import { STATUS_NEW, STATUS_UPDATED } from '../constants.js';

const filterByStatus = ({ status }) =>
  status === STATUS_NEW || status === STATUS_UPDATED;

export const up = async (context, payload) => {
  payload.files = payload.files.filter(filterByStatus);

  if (payload.files.length) {
    await context.transaction(runFiles, payload);
  }

  console.log(green('Migrate: already done\n'));
};
