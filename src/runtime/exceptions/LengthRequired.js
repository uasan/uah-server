import { Exception } from './Exception.js';

export class LengthRequired extends Exception {
  status = 411;
}
