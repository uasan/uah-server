import { Exception } from './Exception.js';

export class NotFound extends Exception {
  status = 404;
}
