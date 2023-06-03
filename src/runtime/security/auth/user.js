import { freeze, nullArray } from '../../utils/native.js';

export const DEFAULT_USER = freeze({
  id: '',
  email: '',
  username: '',
  roles: nullArray,
});

export const isPublicProfile = async ({ sql }, { uid }) =>
  await sql`SELECT is_public AS "0" FROM ludicloud.users WHERE uid = ${uid}`.findOneValue();
