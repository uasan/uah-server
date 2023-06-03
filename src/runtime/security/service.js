import { log } from '../utils/process.js';
import { getExpected } from './error.js';
import { permissions } from './access.js';
import { alwaysFalse } from '../utils/native.js';
import {
  defaultRoles,
  disabledRoles,
  factoryCustomTeamsLead,
  factoryCustomTeamsMember,
  getResolveMethod,
} from './resolve.js';

const setPermissions = async ({ sql }) => {
  const rows = await sql`
  SELECT
    permission,
    permissions.enabled,
    array_agg(DISTINCT roles.role) FILTER(WHERE roles.enabled) AS "enabledRoles",
    array_agg(DISTINCT teams.team_id) FILTER(WHERE teams.is_team_lead) AS "enabledTeamsLead",
    array_agg(DISTINCT teams.team_id) FILTER(WHERE teams.is_team_member) AS "enabledTeamsMember"
  FROM ludicloud.permissions AS permissions
  LEFT JOIN ludicloud.permissions_roles AS roles USING(permission)
  LEFT JOIN ludicloud.permissions_teams AS teams USING(permission)
  WHERE permission = ANY(${Object.keys(permissions)}::text[])
  GROUP BY permission`;

  for (const row of rows) {
    let { acl, rules } = permissions[row.permission];

    if (row.enabled) {
      let roles = row.enabledRoles ?? [];

      if (row.enabledTeamsLead) {
        rules = [...rules, factoryCustomTeamsLead(row.enabledTeamsLead)];
      }

      if (row.enabledTeamsMember) {
        rules = [...rules, factoryCustomTeamsMember(row.enabledTeamsMember)];
      }

      acl.length = 0;
      acl.push(...roles.map(getResolveMethod), ...rules);
      acl.expected = getExpected(acl);
    } else {
      acl.length = 0;
      acl.push(alwaysFalse);
      acl.expected = { enabled: true };
    }
  }
};

const setRoles = async ({ sql }) => {
  const roles = await sql`
    SELECT
      json_agg(role) FILTER (WHERE enabled IS FALSE) AS disabled,
      json_agg(role) FILTER (WHERE enabled AND is_default) AS defaults
    FROM ludicloud.roles`.findOne();

  defaultRoles.length = 0;
  disabledRoles.length = 0;

  if (roles.defaults?.length)
    for (const role of roles.defaults) defaultRoles.push(role);

  if (roles.disabled?.length)
    for (const role of roles.disabled) disabledRoles.push(role);
};

export const securityService = async context => {
  const handlerRoles = () => setRoles(context).catch(log.error);
  const handlerPermissions = () => setPermissions(context).catch(log.error);

  await handlerRoles();
  await handlerPermissions();

  await context.db.listen('roles', handlerRoles);
  await context.db.listen('permissions', handlerPermissions);
};
