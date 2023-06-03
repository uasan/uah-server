import { Exception } from './Exception.js';

export class BadRequest extends Exception {
  static status = 400;
  static message = 'Bad Request';
}
