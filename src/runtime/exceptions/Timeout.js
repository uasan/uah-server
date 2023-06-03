import { Exception } from './Exception.js';

export class Timeout extends Exception {
  static status = 504;
  static message = 'Timeout';
}
