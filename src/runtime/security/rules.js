export {
  isTeamLeader,
  isTeamMemberDirect,
  isTeamMemberReader,
  isTeamLeaderWriter,
  isUserTeamLeader,
} from './rules/teams.js';

export {
  hasJobsByApiKeyAccess,
  hasSkillsByApiKeyAccess,
  hasDataUploadByApiKeyAccess,
} from './rules/apiKey.js';

export { isMyConnection } from './rules/network.js';

export const isUser = context => !!context.uid;

export const isOwner = (context, entity) =>
  isUser(context) && context.uid === entity?.uid;

export const isWriters = (context, entity) =>
  isOwner(context) || entity?.granted_permissions?.[context.uid] > 0;

export const isReaders = (context, entity) =>
  isOwner(context) || entity?.granted_permissions?.[context.uid] !== undefined;

export const isPublicUserProfile = async ({ sql }, entity) =>
  entity?.is_public === true ||
  (entity?.is_public !== false &&
    !!entity?.uid &&
    (await sql`SELECT EXISTS(SELECT 1 FROM ludicloud.users WHERE uid=${entity.uid} AND is_public) AS "0"`.findOneValue()));
