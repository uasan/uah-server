import { Exception } from './Exception.js';

export class Forbidden extends Exception {
  status = 403;
}
