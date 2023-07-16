import { PATH_LIB } from '../../config.js';
import { toRuntimeUrl } from '../helpers/link.js';
import { addTransformer } from '../helpers/ast.js';
import { getExportsOfModule } from '../helpers/checker.js';
import { getSymbolDecorator } from '../helpers/decorators.js';
import { host, declarations, decorators, types } from '../host.js';

import { Int } from './types/validators/int.js';
import { Text } from './types/validators/text.js';
import { UUID } from './types/validators/uuid.js';
import { Email } from './types/validators/email.js';
import { Float } from './types/validators/float.js';
import { Default } from './types/validators/default.js';

import { Postgres } from './decorators/postgres.js';
import { Permission } from './decorators/permission.js';

const lookup = {
  types: {
    Int,
    Float,
    Text,
    UUID,
    Email,
    Default,
  },

  decorators: {
    Postgres,
    Permission,
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
      });
    }
  }
}

export function makeDecorator(node) {
  const symbol = getSymbolDecorator(node.expression);

  if (decorators.has(symbol)) {
    const args = node.expression.arguments ?? [];
    addTransformer(node.parent, node => decorators.get(symbol)(node, ...args));
  } else {
    return host.visitEachChild(node);
  }
}
