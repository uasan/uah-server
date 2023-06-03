import { Exception } from './Exception.js';

export class Unavailable extends Exception {
  static status = 503;
  static message = 'Service Unavailable';
}
