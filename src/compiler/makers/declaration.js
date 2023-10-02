import { PATH_LIB } from '../../config.js';
import { toRuntimeUrl } from '../helpers/link.js';
import { addTransformer } from '../helpers/ast.js';
import {
  getExportsOfModule,
  getOriginSymbolOfNode,
} from '../helpers/checker.js';
import { getSymbolDecorator } from '../helpers/decorators.js';
import { host, declarations, decorators, types } from '../host.js';

import { Int } from './types/validators/Int.js';
import { Text } from './types/validators/Text.js';
import { UUID } from './types/validators/UUID.js';
import { Email } from './types/validators/Email.js';
import { Float } from './types/validators/Float.js';
import { Default } from './types/validators/Default.js';
import { UintArray } from './types/validators/UintArray.js';

import { Postgres } from './decorators/postgres.js';
import { Permission } from './decorators/permission.js';

import { TableModel } from '../entities/models/table.js';
import { ServerContext } from '../entities/api/maker.js';
import { MigrationContext } from '../entities/migrations/maker.js';

export const binaryTypedArray = new WeakSet();
export const lookup = {
  types: {
    Int,
    Float,
    Text,
    UUID,
    Email,
    Default,
    UintArray,
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
      types.set(symbol, lookup.types[name]);
    } else if (hasOwn(lookup.decorators, name)) {
      decorators.set(symbol, lookup.decorators[name]);
    } else if (symbol.valueDeclaration) {
      declarations.set(symbol, {
        url: toRuntimeUrl(symbol.valueDeclaration.getSourceFile().resolvedPath),
        make: hasOwn(lookup.declarations, name)
          ? lookup.declarations[name]
          : null,
      });
    } else if (name === 'TypedArray') {
      binaryTypedArray.add(symbol);

      for (const { typeName } of symbol.declarations[0].type.types) {
        binaryTypedArray.add(getOriginSymbolOfNode(typeName));
      }
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
