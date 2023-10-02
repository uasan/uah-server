import { factoryCallMethod } from '../../helpers/call.js';
import {
  isNullableType,
  getTypeOfSymbol,
  hasStringType,
} from '../../helpers/checker.js';
import {
  factoryString,
  factoryNumber,
  factoryIdentifier,
  factoryAwait,
} from '../../helpers/expression.js';
import { internals } from '../../helpers/internals.js';
import { factoryProperty, factoryObjectLiteral } from '../../helpers/object.js';

export function makePayloadFromQuery(type) {
  let index = 0;
  let path = '';

  const nodes = [];

  for (const symbol of type.getApparentProperties()) {
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

    if (hasStringType(type) === false) {
      value = internals.tryParseJson(value);
    }

    nodes.push(factoryProperty(name, value));
  }

  return { path, data: factoryObjectLiteral(nodes) };
}

export function makePayloadFromBody(payloadValidator) {
  return {
    init: internals.readBody(
      factoryIdentifier('req'),
      factoryIdentifier('res')
    ),
    //internals.decodeJSON
    data: payloadValidator.makeDecoder(factoryAwait(factoryIdentifier('data'))),
  };
}
