import { nullArray, nullObject } from '#utils/native.js';
import {
  isArray,
  isBigInt,
  isBoolean,
  isEmail,
  isInteger,
  isNumber,
  isObject,
  isString,
  isUUID,
} from './checker.js';
import { ValidationErrors as Errors } from './errors.js';

export const Validator = new (class Validator {
  key = '';

  skip = false;
  data = nullObject;

  parent = nullArray;
  errors = nullArray;

  set(data) {
    this.key = '';

    this.skip = false;
    this.data = data;

    this.parent = nullArray;
    this.errors = nullArray;

    return this;
  }

  setKey(key, isOptional = false, defaultValue = undefined) {
    this.key = key;

    if (this.data[key] !== undefined) {
      this.skip = false;
    } else if (isOptional) {
      this.skip = true;
      this.data[key] = defaultValue;
    } else {
      this.setError(Errors.valueMissing);
    }

    return this;
  }

  isNull() {
    this.skip ||= this.data[this.key] === null;
    return this;
  }

  isString() {
    return this.skip || isString(this.data[this.key])
      ? this
      : this.setError(Errors.typeMismatch, 'string');
  }

  isNumber() {
    return this.skip || isNumber(this.data[this.key])
      ? this
      : this.setError(Errors.typeMismatch, 'number');
  }

  isBigInt() {
    return this.skip || isBigInt(this.data[this.key])
      ? this
      : this.setError(Errors.typeMismatch, 'bigint');
  }

  toBigInt() {
    if (!this.skip && !isBigInt(this.data[this.key])) {
      try {
        this.data[this.key] = BigInt(this.data[this.key]);
      } catch {
        this.setError(Errors.typeMismatch, 'bigint');
      }
    }
    return this;
  }

  isBoolean() {
    return this.skip || isBoolean(this.data[this.key])
      ? this
      : this.setError(Errors.typeMismatch, 'boolean');
  }

  isObject() {
    return this.skip || isObject(this.data[this.key])
      ? this
      : this.setError(Errors.typeMismatch, 'object');
  }

  isArray() {
    return this.skip || isArray(this.data[this.key])
      ? this
      : this.setError(Errors.typeMismatch, 'array');
  }

  inArray(array) {
    return this.skip || array.includes(this.data[this.key])
      ? this
      : this.setError(Errors.valueMismatch, array);
  }

  isInt() {
    return this.skip || isInteger(this.data[this.key])
      ? this
      : this.setError(Errors.typeMismatch, 'int');
  }

  isMin(min) {
    return this.skip || this.data[this.key] >= min
      ? this
      : this.setError(Errors.rangeUnderflow, min);
  }

  isMax(max) {
    return this.skip || this.data[this.key] <= max
      ? this
      : this.setError(Errors.rangeOverflow, max);
  }

  isLength(length) {
    return this.skip || this.data[this.key].length === length
      ? this
      : this.setError(
          this.data[this.key].length < length
            ? Errors.tooShort
            : Errors.tooLong,
          length,
        );
  }

  isMinLength(min) {
    return this.skip || this.data[this.key].length >= min
      ? this
      : this.setError(Errors.tooShort, min);
  }

  isMaxLength(max) {
    return this.skip || this.data[this.key].length <= max
      ? this
      : this.setError(Errors.tooLong, max);
  }

  isTextPattern(regexp) {
    return this.skip || regexp.test(this.data[this.key])
      ? this
      : this.setError(Errors.patternMismatch, regexp.toString());
  }

  isUUID() {
    return this.isString().skip || isUUID(this.data[this.key])
      ? this
      : this.setError(Errors.typeMismatch, 'uuid');
  }

  isEmail() {
    return this.isString().skip ||
      isEmail((this.data[this.key] = this.data[this.key].trim().toLowerCase()))
      ? this
      : this.setError(Errors.typeMismatch, 'email');
  }

  trimString() {
    if (this.skip === false) {
      this.data[this.key] = this.data[this.key].trim();
    }
    return this;
  }

  toLowerCase() {
    if (this.skip === false) {
      this.data[this.key] = this.data[this.key].toLowerCase();
    }
    return this;
  }

  toUpperCase() {
    if (this.skip === false) {
      this.data[this.key] = this.data[this.key].toUpperCase();
    }
    return this;
  }

  toDigitsString() {
    if (this.skip === false) {
      this.data[this.key] = this.data[this.key].replace(/\D+/g, '');
    }
    return this;
  }

  toInstance(ctor) {
    if (this.skip === false && this.data[this.key] instanceof ctor === false) {
      try {
        this.data[this.key] = new ctor(this.data[this.key]);
      } catch (e) {
        this.setError(Errors.typeMismatch, ctor.name);
      }
    }
    return this;
  }

  setParent() {
    this.data = this.data[this.key];
    this.parent =
      this.parent === nullArray ? [this.key] : [...this.parent, this.key];

    return this;
  }

  setError(type, expected) {
    this.skip = true;

    if (this.errors === nullArray) {
      this.errors = [];
    }

    this.errors.push({
      type,
      expected,
      value: this.data[this.key],
      path: this.parent === nullArray ? [this.key] : [...this.parent, this.key],
    });

    return this;
  }

  forArray(method) {
    if (this.isArray().skip === false) {
      const { data, parent } = this;
      const { length } = this.setParent().data;

      for (let i = 0; i < length; i++) {
        this.key = i;
        method(this);
        this.skip = false;
      }

      this.data = data;
      this.parent = parent;
    }

    return this;
  }

  forObject(method) {
    if (this.isObject().skip === false) {
      const { data, parent } = this;

      method(this.setParent());

      this.data = data;
      this.parent = parent;
    }

    return this;
  }

  validate() {
    const { errors } = this;

    this.set(nullObject);

    if (errors !== nullArray) {
      throw new Errors(errors);
    }
  }
})();
