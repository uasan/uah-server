import { PATH_LIB } from '../../config.js';
import { toRuntimeUrl } from '../helpers/link.js';
import * as decors from './decorators.js';
import { declarations, decorators, host } from '../host.js';

export const setDeclarations = () => {
  const file = host.program.getSourceFileByPath(PATH_LIB + 'index.d.ts');

  for (const symbol of host.checker.getExportsOfModule(file.symbol)) {
    const path = symbol.valueDeclaration.getSourceFile().resolvedPath;

    if (Object.hasOwn(decors, symbol.name)) {
      decorators.set(symbol, decors[symbol.name]);
    } else {
      declarations.set(symbol, {
        url: toRuntimeUrl(path),
      });
    }
  }
};
