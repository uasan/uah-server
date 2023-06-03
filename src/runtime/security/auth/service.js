import { presets } from '#env';
import { Unauthorized } from '#exceptions/Unauthorized.js';

const { host, applicationId, clientSecret } = presets.auth;

export const validate = async jwt => {
  if (!host) {
    throw new Error('Undefined presets.auth.host');
  }

  const url = `${host}/api/jwt/validate`;
  const headers = { authorization: 'Bearer ' + jwt };

  if ((await fetch(url, { headers })).ok === false) {
    throw new Unauthorized('Invalid token');
  }
};

export const refresh = async (jwt, refreshToken) => {
  if (!host) {
    throw new Error('Undefined presets.auth.host');
  }

  if (!clientSecret) {
    throw new Error('Undefined presets.auth.clientSecret');
  }

  if (!applicationId) {
    throw new Error('Undefined presets.auth.applicationId');
  }

  if (!refreshToken) {
    throw new Error('Undefined refresh_token');
  }

  const url = `${host}/oauth2/token`;
  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: applicationId,
      client_secret: clientSecret,
      access_token: jwt,
      refresh_token: refreshToken,
    }),
  });

  if (response.ok === true) {
    return await response.json();
  } else {
    throw new Unauthorized('Invalid token');
  }
};
