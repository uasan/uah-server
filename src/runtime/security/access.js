import { presets } from '../env.js';
import { isUser, isOwner, isTeamLeader, isUserTeamLeader } from './rules.js';
import { isPublicProfile } from './auth/user.js';
import {
  entries,
  alwaysTrue,
  isFunction,
  isString,
  alwaysFalse,
} from '../utils/native.js';
import {
  SUPERUSER,
  SMARTPLAN_ADMIN,
  LUDICLOUD_ADMIN,
  SMARTPEOPLE_ADMIN,
  SMARTLIBRARY_ADMIN,
  SMARTDATA_ADMIN,
} from './roles.js';
import { permissions, factoryResolve, factoryAccess } from './resolve.js';

entries(presets.app.access).forEach(([name, acl]) => {
  const permission = factoryResolve(acl);

  permission.roles = acl.filter(isString);
  permission.rules = acl.filter(isFunction);

  permissions[name] = permission;
});

export { permissions };
export { byFeatureName, factoryAccess, switchAccess } from './resolve.js';

export const byPrivacyProfile = (
  publicPermission,
  privatePermission = permissions.get_user_profile_private
) => {
  const checkPublicPermission = factoryAccess(publicPermission);
  const checkPrivatePermission = factoryAccess(privatePermission);

  return async (context, entity) =>
    (await isPublicProfile(context, entity))
      ? await checkPublicPermission(context, entity)
      : await checkPrivatePermission(context, entity);
};

export const // preset allows
  notAllow = factoryResolve([alwaysFalse]),
  allowOwner = factoryResolve([isOwner]),
  allowPrivate = factoryResolve([isUser]),
  allowPublic = factoryResolve([alwaysTrue]),
  allowSuperUser = factoryResolve([SUPERUSER]),
  allowAdmin = factoryResolve([presets.app.id + '_admin', SUPERUSER]),
  allowLudiCloudAdmin = factoryResolve([SUPERUSER, LUDICLOUD_ADMIN]),
  allowSmartPlanAdmin = factoryResolve([SUPERUSER, SMARTPLAN_ADMIN]),
  allowSmartPeopleAdmin = factoryResolve([SUPERUSER, SMARTPEOPLE_ADMIN]),
  allowSmartLibraryAdmin = factoryResolve([SUPERUSER, SMARTLIBRARY_ADMIN]),
  allowSmartDataAdmin = factoryResolve([SUPERUSER, SMARTDATA_ADMIN]),
  allowAllAdmin = factoryResolve([
    SUPERUSER,
    LUDICLOUD_ADMIN,
    SMARTPLAN_ADMIN,
    SMARTPEOPLE_ADMIN,
    SMARTLIBRARY_ADMIN,
    SMARTDATA_ADMIN,
  ]),
  allowTeamLeader = factoryResolve([isTeamLeader]),
  allowUserTeamLeader = factoryResolve([isUserTeamLeader]);
