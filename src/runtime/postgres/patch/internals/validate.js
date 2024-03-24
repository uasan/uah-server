import { hasOwn } from '../../../types/checker.js';
import { Validator } from '../../../types/Validator.js';
import { UnProcessable } from '../../../exceptions/UnProcessable.js';

export function validate({ model }, key) {
  if (hasOwn(model.fields, key) === false) {
    throw new UnProcessable(
      `Field "${key}" is not defined in model ${model.name}`
    );
  }

  model.fields[key].validate(Validator).validate();
}
