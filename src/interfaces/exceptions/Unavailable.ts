import { Exception } from './Exception.js';

export class Unavailable extends Exception {
  status = 503;
}
