import { Exception } from './Exception.js';

export class RangeNotSatisfiable extends Exception {
  status = 416;
}
