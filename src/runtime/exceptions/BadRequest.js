import { Exception } from './Exception.js';

export class BadRequest extends Exception {
  status = 400;
}
