import { respondNotModified } from './response/respondCache.js';

export class Cache {
  static checkImmutable(req, res) {
    if (req.getHeader('if-none-match')) {
      respondNotModified(res);
      return true;
    } else return false;
  }

  static setImmutable(context) {
    context.response.headers.push(
      'cache-control',
      'max-age=31536000, immutable',
      'etag',
      '1'
    );
  }

  static setNoStore(context) {
    context.response.headers.push('cache-control', 'no-store');
  }

  static checkAge(req, res) {
    const eTag = req.getHeader('if-none-match');

    if (eTag && +eTag > Date.now()) {
      respondNotModified(res);
      return true;
    } else return false;
  }

  static setAge(context, age) {
    context.response.headers.push(
      'cache-control',
      'max-age=' + age,
      'etag',
      (Date.now() + age * 1000).toString()
    );
  }
}
