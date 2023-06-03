import { validate, createValidate } from '#utils/validate.js';

export function makeValidator(rules) {
  const schema = Object.create(null);

  for (const key of Object.keys(rules))
    if (rules[key].schema) {
      schema[key] = rules[key].schema;
    }

  if (Object.keys(schema).length === 0) {
    return {};
  }

  return {
    result: {
      schema,
      validate,
      isValidPayload: createValidate(schema),
    },
  };
}
