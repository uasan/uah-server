import { Exception } from './Exception.js';

export class ContentTooLarge extends Exception {
  status = 413;
}
