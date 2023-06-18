import { PATH_LIB } from '../../config.js';
import { toRuntimeUrl } from '../helpers/link.js';
import { declarations, decorators, host } from '../host.js';

export const setDeclarations = () => {
  const file = host.program.getSourceFileByPath(PATH_LIB + 'index.d.ts');

  for (const symbol of host.checker.getExportsOfModule(file.symbol)) {
    const path = symbol.valueDeclaration.getSourceFile().resolvedPath;

    if (Object.hasOwn(decorators, symbol.name)) {
      decorators[symbol.name] = symbol;
    } else {
      declarations.set(symbol, {
        url: toRuntimeUrl(path),
      });
    }
  }
};
