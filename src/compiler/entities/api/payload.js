import { factoryCallMethod } from '../../helpers/call.js';
import {
  isNullableType,
  getTypeOfSymbol,
  hasStringType,
  isNumberType,
  isStringType,
  isBooleanType,
} from '../../helpers/checker.js';
import {
  factoryString,
  factoryNumber,
  factoryIdentifier,
  factoryAwait,
} from '../../helpers/expression.js';
import { internals } from '../../helpers/internals.js';
import { factoryProperty, factoryObjectLiteral } from '../../helpers/object.js';

const isBinary = ({ isBinary }) => isBinary;

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

function makeDecodeMethod(ast, metaType) {
  if (metaType.isBinary) {
    return metaType.isFile
      ? factoryCallMethod(ast, 'getFile')
      : metaType.isBlob
      ? factoryCallMethod(ast, 'getBlob')
      : metaType.isStream
      ? factoryCallMethod(ast, 'getStream')
      : metaType.byteLength
      ? factoryCallMethod(ast, 'getSlice', [factoryNumber(metaType.byteLength)])
      : factoryCallMethod(ast, 'getBuffer');
  } else if (isNumberType(metaType.type)) {
    return factoryCallMethod(ast, 'get' + (metaType.numberType || 'Float64'));
  } else if (isStringType(metaType.type)) {
    return factoryCallMethod(ast, 'getString');
  } else if (isBooleanType(metaType.type)) {
    return factoryCallMethod(ast, 'getBoolean');
  } else {
    return factoryCallMethod(ast, 'getJSON');
  }
}

function makeDecodeBuffers(data, props) {
  const nodes = [];
  const decodeAst = internals.decodeBuffers();

  for (let i = 0; i < props.length; i++) {
    nodes.push(
      factoryProperty(
        props[i].name,
        makeDecodeMethod(
          i ? decodeAst : factoryCallMethod(decodeAst, 'from', [data]),
          props[i]
        )
      )
    );
  }

  return factoryObjectLiteral(nodes);
}

const decodeBuffersFrom = data =>
  factoryCallMethod(internals.decodeBuffers(), 'from', [data]);

export function makePayloadFromBody(metaType) {
  const args = [factoryIdentifier('req'), factoryIdentifier('res')];

  let init = metaType.isStream
    ? internals.readStream(args)
    : metaType.isPartStream
    ? internals.readPartStream(args)
    : internals.readBody(args);

  let data = factoryAwait(factoryIdentifier('data'));

  if (metaType.isBinary) {
    if (metaType.isPartStream) {
      data = makeDecodeMethod(decodeBuffersFrom(data), metaType);
    }
  } else if (metaType.props.some(isBinary)) {
    data = makeDecodeBuffers(data, metaType.props);
  } else {
    data = internals.decodeJSON(data);
  }

  return { init, data };
}
