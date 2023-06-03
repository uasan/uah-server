import { Exception } from './Exception.js';

export class Conflict extends Exception {
  static status = 409;
  static message = 'Conflict';
}
