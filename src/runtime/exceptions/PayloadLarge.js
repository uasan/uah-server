import { Exception } from './Exception.js';

export class PayloadLarge extends Exception {
  static status = 413;
  static message = 'Payload Too Large';
}
