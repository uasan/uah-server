import { Exception } from './Exception.js';

export class Timeout extends Exception {
  status = 504;
}
