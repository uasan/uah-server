export const { hasOwn } = Object;
export const { isArray } = Array;
export const { isInteger } = Number;

export const isNumber = value => typeof value === 'number';
export const isString = value => typeof value === 'string';
export const isBoolean = value => typeof value === 'boolean';
export const isFunction = value => typeof value === 'function';
export const isObject = value => typeof value === 'object' && value !== null;

export const isEmail = RegExp.prototype.test.bind(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
export const isUUID = RegExp.prototype.test.bind(
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
);
