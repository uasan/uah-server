import { declarations, types, host } from '../host.js';
import { PATH_LIB } from '../../config.js';
import { toRuntimeUrl } from '../helpers/link.js';

export const setDeclarations = () => {
  const file = host.program.getSourceFileByPath(PATH_LIB + 'index.d.ts');

  for (const symbol of host.checker.getExportsOfModule(file.symbol)) {
    const path = symbol.valueDeclaration.getSourceFile().resolvedPath;

    declarations.set(symbol, {
      path,
      url: toRuntimeUrl(path),
    });
  }
};
