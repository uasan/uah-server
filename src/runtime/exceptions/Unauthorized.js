import { Exception } from './Exception.js';

export class Unauthorized extends Exception {
  static status = 401;
  static message = 'Unauthorized';
}
