import { Exception } from './Exception.js';

export class UnProcessable extends Exception {
  status = 422;
}
