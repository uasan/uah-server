import { Exception } from './Exception.js';

export class NotAllowed extends Exception {
  static status = 405;
  static message = 'Not Allowed';
}
