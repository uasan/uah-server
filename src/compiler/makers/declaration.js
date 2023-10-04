import { PATH_LIB } from '../../config.js';
import { toRuntimeUrl } from '../helpers/link.js';
import { addTransformer } from '../helpers/ast.js';
import { getExportsOfModule } from '../helpers/checker.js';
import { getSymbolDecorator } from '../helpers/decorators.js';
import { host, declarations, decorators, types } from '../host.js';

import { Int } from './types/validators/Int.js';
import { Text } from './types/validators/Text.js';
import { UUID } from './types/validators/UUID.js';
import { Email } from './types/validators/Email.js';
import { Float } from './types/validators/Float.js';
import { Default } from './types/validators/Default.js';
import { Uint8Array } from './types/validators/Uint8Array.js';
import { TypedArray } from './types/validators/TypedArray.js';
import { BinaryData } from './types/validators/BinaryData.js';

import { Postgres } from './decorators/postgres.js';
import { Permission } from './decorators/permission.js';

import { TableModel } from '../entities/models/table.js';
import { ServerContext } from '../entities/api/maker.js';
import { MigrationContext } from '../entities/migrations/maker.js';

export const lookup = {
  types: {
    Int,
    Float,
    Text,
    UUID,
    Email,
    Default,
    Uint8Array,
    TypedArray,
    BinaryData,
  },

  decorators: {
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

    if (hasOwn(lookup.types, name)) {
      const ctor = lookup.types[name];

      ctor.symbol = symbol;
      ctor.type = host.checker.getDeclaredTypeOfSymbol(symbol);

      types.set(symbol, ctor);
    } else if (hasOwn(lookup.decorators, name)) {
      decorators.set(symbol, lookup.decorators[name]);
    } else if (symbol.valueDeclaration) {
      declarations.set(symbol, {
        url: toRuntimeUrl(symbol.valueDeclaration.getSourceFile().resolvedPath),
        make: hasOwn(lookup.declarations, name)
          ? lookup.declarations[name]
          : null,
      });
    }
  }
}

export function makeDecorator(node) {
  const symbol = getSymbolDecorator(node.expression);

  if (decorators.has(symbol)) {
    const arg = node.expression.arguments?.[0];

    addTransformer(node.parent, (node, original) =>
      decorators.get(symbol)(node, original, arg)
    );
  } else {
    return host.visitEachChild(node);
  }
}
