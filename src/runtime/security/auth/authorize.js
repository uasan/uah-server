import { presets } from '#env';
import { Unauthorized } from '#exceptions/Unauthorized.js';
import { allowPublic } from '#security/access.js';
import { defaultRoles, disabledRoles } from '../resolve.js';
import { cookie, deleteAuthCookies } from './cookie.js';
import { Token, TokenExpired } from './token.js';

export const getUserAccessToken = context =>
  context.cookies?.get(cookie.token.name);

export const authorize = async (context, route) => {
  const uid = context.cookies.get(cookie.uid.name);
  const jwt = context.cookies.get(cookie.token.name);

  if (uid && jwt) {
    try {
      const token = new Token(jwt);
      const user = token.getUser();

      if (presets.app.isProduction) {
        try {
          await token.verify();
        } catch (error) {
          if (error instanceof TokenExpired) {
            try {
              const r = await token.refresh(cookie.refreshToken.get(context));

              cookie.token.set(context, r.access_token);
              cookie.refreshToken.set(context, r.refresh_token);
            } catch (error) {
              throw new Unauthorized();
            }
          } else throw error;
        }
      }

      if (uid === user.id) {
        context.uid = uid;
        context.user = user;

        for (let i = 0; i < defaultRoles.length; i++)
          if (user.roles.includes(defaultRoles[i]) === false) {
            user.roles.push(defaultRoles[i]);
          }

        for (let i = 0; i < disabledRoles.length; i++)
          if (user.roles.includes(disabledRoles[i])) {
            user.roles.splice(user.roles.indexOf(disabledRoles[i]), 1);
          }
      } else {
        throw new Unauthorized();
      }
    } catch (error) {
      deleteAuthCookies(context);
      throw error;
    }
  } else {
    if (uid !== undefined) {
      cookie.uid.delete(context);
    }

    if (jwt !== undefined) {
      cookie.token.delete(context);
      cookie.refreshToken.delete(context);
    }

    if (route?.checkAccess !== allowPublic && !route?.public) {
      throw new Unauthorized();
    }

    context.set('x-robots-tag', 'none');
    context.set('cache-control', 'private');
  }
};
