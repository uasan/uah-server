import { NotFound } from '../../../exceptions/NotFound.js';
import { UnProcessable } from '../../../exceptions/UnProcessable.js';

export const errorNotArray = name =>
  new UnProcessable(`Field "${name}" must be an array`);

export const errorNotObject = name =>
  new UnProcessable(`Field "${name}" must be an object`);

export const errorNotFound = () => new NotFound(`Not found entity`);

export const errorFieldUndefined = (model, key) =>
  new UnProcessable(`Field "${key}" is not defined in model ${model.name}`);
