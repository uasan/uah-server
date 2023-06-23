import { Exception } from './Exception.js';

export class Unauthorized extends Exception {
  status = 401;
}
