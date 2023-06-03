import { Forbidden } from '../exceptions/Forbidden.js';
import { Unauthorized } from '../exceptions/Unauthorized.js';

export const getExpected = acl => {
  const expected = {};
  for (const { name, value } of acl) {
    if (!expected[name]) {
      expected[name] = [];
    }
    if (value) {
      expected[name].push(value);
    }
  }
  return expected;
};

export const throwAccessDenied = (context, expected) => {
  throw context.uid
    ? new Forbidden().putErrors([
        {
          type: 'accessDenied',
          expected,
        },
      ])
    : new Unauthorized();
};
