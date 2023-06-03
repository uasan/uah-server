import { Exception } from './Exception.js';

export class Forbidden extends Exception {
  static status = 403;
  static message = 'Forbidden';
}
