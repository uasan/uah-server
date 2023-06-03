import {
  keys,
  create,
  isArray,
  isString,
  isFunction,
  throwError,
  alwaysFalse,
} from '../utils/native.js';
import { getExpected, throwAccessDenied } from './error.js';

export const cacheIsRoles = create(null);
export const permissions = create(null);

export const defaultRoles = [];
export const disabledRoles = [];

export const getResolveMethod = value => {
  if (isFunction(value)) {
    return value;
  }
  if (isString(value)) {
    if (!cacheIsRoles[value]) {
      const isRole = ({ user }) => user.roles.includes(value);
      isRole.value = value;
      cacheIsRoles[value] = isRole;
    }
    return cacheIsRoles[value];
  }

  if (value === false) {
    return alwaysFalse;
  }

  throw new Error('ACL role name must type string');
};

async function getCustomTeamsLeadValue({ sql, uid = null }) {
  return await sql`
    SELECT json_agg(DISTINCT id) AS "0"
    FROM ludicloud.teams_users
    WHERE lid = ${uid} AND id = ANY(${this.value})
  `.findOneValue();
}

async function getCustomTeamsMemberValue({ sql, uid = null }) {
  return await sql`
    SELECT json_agg(id) AS "0"
    FROM ludicloud.teams_users
    WHERE uid = ${uid} AND id = ANY(${this.value})
  `.findOneValue();
}

export const factoryCustomTeamsLead = teams => {
  const isCustomTeamsLead = async ({ sql, uid = null }) =>
    await sql`SELECT EXISTS (SELECT 1 FROM ludicloud.teams_users WHERE lid = ${uid} AND id = ANY(${teams}::uuid[])) AS "0"`.findOneValue();

  isCustomTeamsLead.value = teams;
  isCustomTeamsLead.getValue = getCustomTeamsLeadValue;

  return isCustomTeamsLead;
};

export const factoryCustomTeamsMember = teams => {
  const isCustomTeamsMember = async ({ sql, uid = null }) =>
    await sql`SELECT EXISTS (SELECT 1 FROM ludicloud.teams_users WHERE uid = ${uid} AND id = ANY(${teams}::uuid[])) AS "0"`.findOneValue();

  isCustomTeamsMember.value = teams;
  isCustomTeamsMember.getValue = getCustomTeamsMemberValue;

  return isCustomTeamsMember;
};

export const factoryResolve = acl => {
  if (!isArray(acl)) {
    throw new Error('ACL must type array');
  }

  acl = acl.map(getResolveMethod);
  acl.expected = getExpected(acl);

  const checkAccess = async (context, payload, isNotThrow = false) => {
    for (let i = 0; i < acl.length; i++) {
      const check = acl[i];
      if ((await check(context, payload, isNotThrow)) === true) return true;
    }

    if (isNotThrow) return false;
    throwAccessDenied(context, acl.expected);
  };

  checkAccess.acl = acl;
  return checkAccess;
};

export const byFeatureName = name =>
  permissions[name] ??
  throwError(new Error(`Invalid feature access name "${name}"`));

export const factoryAccess = (acl = permissions.default) =>
  isFunction(acl)
    ? acl
    : isString(acl)
    ? byFeatureName(acl)
    : factoryResolve(acl);

export const switchAccess = (name, cases, caseDefault) => {
  const acl = [];

  for (const key of keys(cases)) {
    const resolve = factoryAccess(cases[key]);

    const isCase = (context, payload, isNotThrow) =>
      String(payload?.[name]) === key && resolve(context, payload, isNotThrow);

    acl.push(isCase);
  }

  if (caseDefault) {
    acl.push(factoryAccess(caseDefault));
  }

  return factoryResolve(acl);
};
