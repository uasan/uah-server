import { Unauthorized } from '#runtime/exceptions/Unauthorized.js';
import { stringifyBase64Url } from '#runtime/types/json.js';
import { createHmac, randomUUID } from 'crypto';

const algorithms = {
  HS256: (key, data) => createHmac('sha256', key).update(data).digest('base64Url'),
  HS384: (key, data) => createHmac('sha384', key).update(data).digest('base64Url'),
  HS512: (key, data) => createHmac('sha512', key).update(data).digest('base64Url'),
};

const defaultOptions = {
  algorithm: 'HS256',
  cookies: {
    uid: {
      name: 'UID',
      httpOnly: false,
      sameSite: 'Lax',
    },
    jwt: {
      name: 'JWT',
      httpOnly: true,
      sameSite: 'Lax',
    },
  },
};

function parseJSON(string) {
  try {
    return JSON.parse(Buffer.from(string, 'base64Url'));
  } catch {
    throw new Unauthorized('Invalid syntax JWT');
  }
}

async function auth() {
  const { secret, cookies } = this.constructor.session;
  const parts = this.request.cookies.get(cookies.jwt.name)?.split('.', 3);

  if (parts?.length === 3) {
    const head = parseJSON(parts[0]);
    const data = parseJSON(parts[1]);

    if (Object.hasOwn(algorithms, head.alg) === false) {
      throw new Unauthorized(`Unsupported algorithm: ${head.alg}`);
    }

    if (data.exp < Date.now() / 1_000) {
      throw new Unauthorized('Expired JWT');
    }

    if (algorithms[head.alg](secret, parts[0] + '.' + parts[1]) !== parts[2]) {
      throw new Unauthorized('Invalid JWT signature');
    }

    if (!data.user.id || data.user.id !== this.request.cookies.get(cookies.uid.name)) {
      throw new Unauthorized('Invalid JWT user');
    }

    this.session = data;
    this.user = data.user;
  } else {
    throw new Unauthorized('Undefined session JWT');
  }
}

async function createSession(user) {
  const { secret, cookies, algorithm, maxAge } = this.constructor.session;

  const jti = randomUUID();
  const iat = Math.round(Date.now() / 1_000);
  const exp = iat + maxAge;

  const header = { alg: algorithm, typ: 'JWT' };
  const session = { iat, exp, jti, user };

  const hash = stringifyBase64Url(header) + '.' + stringifyBase64Url(session);

  this.user = user;
  this.session = session;

  this.response.setCookie(cookies.uid, user.id);
  this.response.setCookie(cookies.jwt, hash + '.' + algorithms[algorithm](secret, hash));
}

async function deleteSession() {
  const { cookies } = this.constructor.session;

  this.user = null;
  this.session = null;
  this.response.deleteCookie(cookies.uid);
  this.response.deleteCookie(cookies.jwt);
}

export function SessionJWT(
  { prototype },
  { secret, maxAge, algorithm = defaultOptions.algorithm, cookies = defaultOptions.cookies },
) {
  prototype.auth = auth;
  prototype.createSession = createSession;
  prototype.deleteSession = deleteSession;

  return {
    maxAge,
    secret,
    cookies,
    algorithm,
  };
}
