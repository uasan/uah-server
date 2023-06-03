export const isTeamLeader = async ({ sql, uid: lid }, entity) => {
  if (!lid || !entity?.uid) return false;
  const { uid } = entity;

  return await sql`SELECT EXISTS(
    SELECT 1 FROM ludicloud.teams_users WHERE uid = ${uid} AND lid = ${lid}
    UNION
    SELECT 1 FROM (WITH RECURSIVE teams_leads(id, uid) AS (
      SELECT members.id, members.lid AS uid
      FROM (SELECT DISTINCT id FROM ludicloud.teams_users JOIN ludicloud.teams USING (id) WHERE teams_users.lid = ${lid} AND teams.options ? 'leader_can_see_all') _
      JOIN (SELECT id, lid FROM ludicloud.teams_users WHERE uid = ${uid}) AS members USING (id)
      UNION
      SELECT leads.id, leads.lid AS uid FROM teams_leads JOIN ludicloud.teams_users AS leads USING(id, uid)
    )
    SELECT 1 FROM teams_leads WHERE uid = ${lid} LIMIT 1)_) AS "0"`.findOneValue();
};

export const isTeamMemberDirect = async ({ sql, uid: lid }, entity) => {
  if (!lid || !entity?.uid) return false;
  const { uid } = entity;

  return await sql`SELECT EXISTS(
    SELECT 1
    FROM (SELECT id FROM ludicloud.teams_users WHERE uid = ${lid} OR lid = ${lid}) AS own_teams
    JOIN (SELECT id FROM ludicloud.teams_users WHERE uid = ${uid} OR lid = ${uid}) AS users_teams USING (id)
  ) AS "0"`.findOneValue();
};

export const isTeamMemberReader = async ({ sql, uid }, entity) => {
  if (!uid || !entity?.uid) return false;

  return await sql`SELECT EXISTS(
    SELECT 1
    FROM (
      SELECT id, lid FROM ludicloud.teams_users WHERE uid = ${uid}
      INTERSECT
      SELECT id, lid FROM ludicloud.teams_users WHERE uid = ${entity.uid}
    ) AS users
    JOIN ludicloud.teams AS teams USING (id)
    WHERE teams.options->'member_see_each_other' ? 'profile_details') AS "0"`.findOneValue();
};

export const isTeamLeaderWriter = async ({ sql, uid: lid }, entity) => {
  if (!lid || !entity?.uid) return false;

  return await sql`SELECT EXISTS (
    SELECT 1 FROM (SELECT id FROM ludicloud.teams_users WHERE uid = ${entity.uid} AND lid = ${lid}) AS teams_users
    JOIN ludicloud.teams AS teams ON(teams_users.id = teams.id AND teams.options ? 'leader_can_modify')) AS "0"`.findOneValue();
};

export const isUserTeamLeader = async ({ sql, uid }) =>
  await sql`SELECT EXISTS (
    SELECT 1 FROM ludicloud.teams_users WHERE lid = ${uid}
  ) AS "0"`.findOneValue();
