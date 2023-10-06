import { Exception } from './Exception.js';

export class NotAllowed extends Exception {
  status = 405;
}
