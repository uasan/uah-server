import { Context } from '../context.js';
import { STATUS_NEW } from './constants.js';

export class MigrationContext extends Context {
  static hash = null;
  static version = null;
  static wasDone = false;

  status = STATUS_NEW;
  isBootStrap = true;
}
