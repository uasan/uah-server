import { PATH_LIB } from '../../config.js';
import { toRuntimeUrl } from '../helpers/link.js';
import * as decors from './decorators.js';
import { host, declarations, decorators, types } from '../host.js';
import { getExportsOfModule } from '../helpers/checker.js';

import { typeNames } from './types/names.js';

const { hasOwn } = Object;

export const setDeclarations = () => {
  const file = host.program.getSourceFileByPath(PATH_LIB + 'index.d.ts');

  for (const symbol of getExportsOfModule(file)) {
    const name = symbol.name;

    if (hasOwn(typeNames, name)) {
      types.set(symbol, typeNames[name]);
    } else if (hasOwn(decors, name)) {
      decorators.set(symbol, decors[name]);
    } else if (symbol.valueDeclaration) {
      declarations.set(symbol, {
        url: toRuntimeUrl(symbol.valueDeclaration.getSourceFile().resolvedPath),
      });
    }
  }
};
