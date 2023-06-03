import { byFeatureName } from './resolve.js';
import { DEFAULT_USER } from './auth/user.js';

async function isAccess(name, payload) {
  return await byFeatureName(name)(this, payload, true);
}

async function getPermissionResult() {
  for (const check of this.route?.checkAccess.acl)
    if (await check(this, this.payload, true))
      return {
        [check.name]: (await check.getValue?.(this)) || check.value || true,
      };
}

export const setSecurityContext = context => {
  context.uid = null;
  context.user = DEFAULT_USER;
  context.isAccess = isAccess;
  context.getPermissionResult = getPermissionResult;
};
