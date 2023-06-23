import { Exception } from './Exception.js';

export class Conflict extends Exception {
  status = 409;
}
