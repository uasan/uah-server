import { Exception } from './Exception.js';

export class NotFound extends Exception {
  static status = 404;
  static message = 'Not Found';
}
