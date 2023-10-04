import { Validator } from '../Validator.js';

export class Uint8Array extends Validator {
  sqlType = 'bytea';
  bytesPerElement = 1;

  static make(meta, args) {
    const self = new this().setProps(meta, args?.[0]);

    meta.sqlType = this.sqlType;

    if (self.props.has('length')) {
      meta.byteLength =
        Number(self.props.get('length').text) * self.bytesPerElement;
    } else {
      if (self.props.has('minLength')) {
        meta.minByteLength =
          Number(self.props.get('minLength').text) * self.bytesPerElement;
      }

      if (self.props.has('maxLength')) {
        meta.maxByteLength =
          Number(self.props.get('maxLength').text) * self.bytesPerElement;
      }
    }
  }
}
