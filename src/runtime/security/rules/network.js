export const isMyConnection = async ({ sql, uid }, entity) => {
  if (!entity?.uid) return false;

  return await sql`SELECT EXISTS (
    SELECT 1
    FROM ludicloud.users_network
    WHERE uid = ${uid} AND target = ${entity.uid} AND accepted
  ) AS "0"`.findOneValue();
};
