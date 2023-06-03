import { BadRequest } from '#exceptions/BadRequest.js';
import { validate, validator } from '#utils/validate.js';
import { idx, noop, parse, isString } from '../utils/native.js';

export const setValidate = route => {
  const schema = {
    ...route.params?.path,
    ...route.params?.query,
    ...route.params?.body,
    ...route.params?.files,
  };

  if (Object.keys(schema).length) {
    schema.$$strict = true;
    route.validate = validate;
    route.isValidPayload = validator.compile(schema);
  } else {
    route.validate = noop;
  }
};

const castBoolean = value =>
  value === 'true' ? true : value === 'false' ? false : value;

const castJSON = value => {
  try {
    return parse(value);
  } catch (error) {
    throw BadRequest.of(error);
  }
};

export const getRuleAsObject = rule =>
  isString(rule)
    ? validator.parseShortHand(rule)
    : rule.$$type
    ? validator.parseShortHand(rule.$$type)
    : rule;

export const getMethodCast = rule => {
  switch (getRuleAsObject(rule).type) {
    case 'number':
      return Number;

    case 'boolean':
      return castBoolean;

    case 'object':
    case 'array':
    case 'tuple':
      return castJSON;

    default:
      return idx;
  }
};
