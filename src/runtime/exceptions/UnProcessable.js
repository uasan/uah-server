import { Exception } from './Exception.js';

export class UnProcessable extends Exception {
  static status = 422;
  static message = 'Unprocessable entity';
}
