import { createHmac } from 'crypto';
import { presets } from '#env';
import { Unauthorized } from '#exceptions/Unauthorized.js';
import { validate, refresh } from './service.js';
import { uuid } from '../../utils/uuid.js';
import { log } from '../../utils/process.js';

const { now } = Date;
const promises = new Map();
const { applicationId, jwtSecret } = presets.auth;

const algorithms = {
  HS256: (key, data) =>
    createHmac('sha256', key).update(data).digest('base64Url'),
  HS384: (key, data) =>
    createHmac('sha384', key).update(data).digest('base64Url'),
  HS512: (key, data) =>
    createHmac('sha512', key).update(data).digest('base64Url'),
};

export class TokenInvalid extends Unauthorized {}
export class TokenExpired extends Unauthorized {}

export class Token {
  constructor(jwt) {
    const parts = jwt.split('.', 3);

    if (!parts[0] || !parts[1] || !parts[2]) {
      throw new TokenInvalid();
    }

    const { alg } = JSON.parse(Buffer.from(parts[0], 'base64'));

    this.jwt = jwt;
    this.signature = parts[2];
    this.algorithm = algorithms[alg];
    this.data = parts[0] + '.' + parts[1];
    this.payload = JSON.parse(Buffer.from(parts[1], 'base64'));
  }

  async verify() {
    if (this.algorithm === undefined) {
      await validate(this.jwt);
    } else if (jwtSecret) {
      if (this.algorithm(jwtSecret, this.data) !== this.signature) {
        throw new Unauthorized('Invalid token signature');
      }
    } else {
      log.error('Need define process.env.AUTH_JWT_SECRET_KEY');
      await validate(this.jwt);
    }
    if (this.payload.exp < now() / 1000) {
      throw new TokenExpired('Expired token');
    }
  }

  async refresh(token) {
    if (promises.has(token)) {
      return await promises.get(token);
    }

    const promise = refresh(this.jwt, token);
    promises.set(token, promise);

    try {
      return await promise;
    } finally {
      setTimeout(() => promises.delete(token), 10_000);
    }
  }

  getUser() {
    return {
      id: this.payload.sub || '',
      email: this.payload.email || '',
      roles: this.payload.roles || [],
      username: this.payload.preferred_username,
    };
  }

  static create({
    payload = {},
    secret = jwtSecret,
    clientId = applicationId,
    duration = 1 * 60 * 60 * 1000,
  } = {}) {
    if (!secret) log.error('Need define process.env.AUTH_JWT_SECRET_KEY');

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const iat = now();
    payload = {
      aud: clientId,
      exp: iat + duration,
      iat: iat,
      iss: presets.app.origin,
      sub: presets.app.id,
      jti: uuid.random(),
      applicationId: clientId,
      ...payload,
    };
    const encodedHeaders = Buffer.from(JSON.stringify(header)).toString(
      'base64Url'
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64Url'
    );
    const encodedSignature = Buffer.from(
      algorithms.HS256(secret, `${encodedHeaders}.${encodedPayload}`)
    );

    return `${encodedHeaders}.${encodedPayload}.${encodedSignature}`;
  }

  static tokens = new Map();

  static getToken(name, params) {
    const { tokens } = Token;
    let token = tokens.get(name);
    if (token) {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64Url').toString()
      );
      const now = Date.now();

      if (payload.exp > now) {
        return token;
      }
    }

    token = Token.create(params);
    tokens.set(name, token);
    return token;
  }
}
