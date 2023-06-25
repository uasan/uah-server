import { UnProcessable } from '../exceptions/UnProcessable.js';

const ERROR_TYPE_MISMATCH = 'typeMismatch';
const ERROR_VALUE_MISSING = 'valueMissing';
const ERROR_VALUE_MISMATCH = 'valueMismatch';

const enumValues = new WeakMap();

function setEnumValues(ref) {
  const values = Object.values(ref);
  enumValues.set(ref, values);
  return values;
}

const { isArray } = Array;
const isString = value => typeof value === 'string';
const isObject = value => typeof value === 'object' && value !== null;
const isNumber = value => typeof value === 'number' && isNaN(value) === false;

class InputErrors extends UnProcessable {
  constructor(errors) {
    super('Input errors');
    this.errors = errors;
  }
}

export class Validator {
  key = '';
  data = null;

  skip = false;
  errors = null;

  constructor(data) {
    if (isObject(data) === false) {
      throw new UnProcessable(ERROR_TYPE_MISMATCH);
    }
    this.data = data;
  }

  setKey(key, isOptional = false, defaultValue = undefined) {
    this.key = key;

    if (this.data[key] !== undefined) {
      this.skip = false;
    } else if (isOptional) {
      this.skip = true;
      this.data[key] = defaultValue;
    } else {
      this.setError(ERROR_VALUE_MISSING);
    }

    return this;
  }

  setError(type, expected) {
    this.skip = true;

    this.errors ??= {};
    this.errors[this.key] = {
      type,
      expected,
      value: this.data[this.key],
    };

    return this;
  }

  checkNull() {
    this.skip ||= this.data[this.key] === null;
    return this;
  }

  checkString() {
    return this.skip || isString(this.data[this.key])
      ? this
      : this.setError(ERROR_TYPE_MISMATCH, 'string');
  }

  checkNumber() {
    return this.skip || isNumber(this.data[this.key])
      ? this
      : this.setError(ERROR_TYPE_MISMATCH, 'number');
  }

  checkObject() {
    return this.skip || isObject(this.data[this.key])
      ? this
      : this.setError(ERROR_TYPE_MISMATCH, 'object');
  }

  checkUnit(values) {
    return this.skip || values.includes(this.data[this.key])
      ? this
      : this.setError(ERROR_VALUE_MISMATCH, values);
  }

  checkEnum(object) {
    return this.skip
      ? this
      : this.checkUnit(enumValues.get(object) ?? setEnumValues(object));
  }

  checkArray() {
    return this.skip || isArray(this.data[this.key])
      ? this
      : this.setError(ERROR_TYPE_MISMATCH, 'array');
  }

  validate() {
    if (this.errors) throw new InputErrors(this.errors);
  }
}
