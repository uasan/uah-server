import { Validator } from '../Validator.js';

export class Blob extends Validator {
  static make(meta, args) {
    const self = new this().setProps(meta, args?.[0]);

    meta.isBlob = true;
    meta.isConstruct = true;
    meta.isBufferStream = true;

    if (meta.sql) {
      meta.sql.type = 'bytea';
    }

    if (self.props.has('maxLength')) {
      meta.maxByteLength = Number(self.props.get('maxLength').text);
    }
  }
}
