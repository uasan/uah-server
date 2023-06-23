import { factoryCallMethod } from '../../helpers/call.js';
import {
  isNullableType,
  getTypeOfSymbol,
  isNumberType,
  getApparentProperties,
  isBooleanType,
  isObjectType,
} from '../../helpers/checker.js';
import {
  factoryString,
  factoryNumber,
  factoryIdentifier,
  factoryAwait,
} from '../../helpers/expression.js';
import { internals } from '../../helpers/internals.js';
import { factoryProperty, factoryObjectLiteral } from '../../helpers/object.js';

export function makePayloadFromQuery(node) {
  let index = 0;
  let path = '';

  const nodes = [];

  for (const symbol of getApparentProperties(node)) {
    let value;
    const name = symbol.escapedName;

    const req = factoryIdentifier('req');
    const type = getTypeOfSymbol(symbol);
    const isNullable = isNullableType(type);

    if (isNullable) {
      value = factoryCallMethod(req, 'getQuery', [factoryString(name)]);
    } else {
      path += '/:' + name;
      value = factoryCallMethod(req, 'getParameter', [factoryNumber(++index)]);
    }

    if (isObjectType(type)) {
      value = internals.tryParseJson(value);
    } else if (isNumberType(type)) {
      value = internals.tryToNumber(value);
    } else if (isBooleanType(type)) {
      value = internals.tryToBoolean(value);
    }

    nodes.push(factoryProperty(name, value));
  }

  return { path, data: factoryObjectLiteral(nodes) };
}

export function makePayloadFromBody() {
  return {
    init: internals.readBody(
      factoryIdentifier('req'),
      factoryIdentifier('res')
    ),
    data: internals.decodeJSON(factoryAwait(factoryIdentifier('data'))),
  };
}
