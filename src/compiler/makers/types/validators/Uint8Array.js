import { Validator } from '../Validator.js';

export class Uint8Array extends Validator {
  static make(meta, args) {
    new this().setProps(meta, args?.[0]);
  }
}
