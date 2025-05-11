import { PATH_LIB } from '../../config.js';
import { addTransformer } from '../helpers/ast.js';
import { getExportsOfModule } from '../helpers/checker.js';
import { getSymbolDecorator } from '../helpers/decorators.js';
import { toRuntimeUrl } from '../helpers/link.js';
import { declarations, decorators, host, internalSymbols, types } from '../host.js';

import { Int } from './types/validators/Int.js';
import { Int16 } from './types/validators/Int16.js';
import { Int32 } from './types/validators/Int32.js';
import { Int8 } from './types/validators/Int8.js';
import { Uint16 } from './types/validators/Uint16.js';
import { Uint32 } from './types/validators/Uint32.js';
import { Uint8 } from './types/validators/Uint8.js';

import { BigIntSerial } from './types/validators/BigIntSerial.js';
import { BinaryData } from './types/validators/BinaryData.js';
import { Blob } from './types/validators/Blob.js';
import { DateLike } from './types/validators/DateLike.js';
import { Default } from './types/validators/Default.js';
import { Email } from './types/validators/Email.js';
import { File } from './types/validators/File.js';
import { Float } from './types/validators/Float.js';
import { Float32 } from './types/validators/Float32.js';
import { Text } from './types/validators/Text.js';
import { TypedArray } from './types/validators/TypedArray.js';
import { Uint8Array } from './types/validators/Uint8Array.js';
import { UUID } from './types/validators/UUID.js';

import { Cache } from './decorators/cache.js';
import { Permission } from './decorators/permission.js';
import { Postgres } from './decorators/postgres.js';
import { Table } from './decorators/table.js';

import { ServerContext } from '../entities/api/maker.js';
import { MigrationContext } from '../entities/migrations/maker.js';
import { TableModel } from '../entities/models/table.js';
import { WebSocketRPC } from './protocols/WebSocketRPC.js';

export const lookup = {
  types: {
    Int,
    Int8,
    Int16,
    Int32,
    Uint8,
    Uint16,
    Uint32,
    Float,
    Float32,
    Text,
    Blob,
    File,
    UUID,
    Email,
    Default,
    DateLike,
    BinaryData,
    Uint8Array,
    TypedArray,
    BigIntSerial,
    WebSocketRPC,
  },

  decorators: {
    Cache,
    Table,
    Postgres,
    Permission,
  },

  declarations: {
    TableModel,
    ServerContext,
    MigrationContext,
  },
};

const { hasOwn } = Object;

export function setDeclarations() {
  const file = host.program.getSourceFileByPath(PATH_LIB + 'index.d.ts');

  for (const symbol of getExportsOfModule(file)) {
    const name = symbol.escapedName;

    internalSymbols.add(symbol);

    if (symbol.valueDeclaration) {
      declarations.set(symbol, {
        url: toRuntimeUrl(symbol.valueDeclaration.getSourceFile().resolvedPath),
        make: hasOwn(lookup.declarations, name)
          ? lookup.declarations[name]
          : null,
      });
    }

    if (hasOwn(lookup.types, name)) {
      const ctor = lookup.types[name];

      ctor.symbol = symbol;
      ctor.type = host.checker.getDeclaredTypeOfSymbol(symbol);

      types.set(symbol, ctor);
    } else if (hasOwn(lookup.decorators, name)) {
      decorators.set(symbol, lookup.decorators[name]);
    }
  }
}

export function makeDecorator(node) {
  const symbol = getSymbolDecorator(node.expression);

  if (decorators.has(symbol)) {
    const { expression } = node;

    addTransformer(node.parent, (node, original) => decorators.get(symbol)(node, original, expression));
  } else {
    return host.visitEachChild(node);
  }
}
