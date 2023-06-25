import { PATH_LIB } from '../../config.js';
import { toRuntimeUrl } from '../helpers/link.js';
import * as decors from './decorators.js';
import { host, types, declarations, decorators } from '../host.js';
import {
  getExportsOfModule,
  getOriginSymbolOfNode,
} from '../helpers/checker.js';

export const typeNames = {
  Default: {
    symbol: null,
    is(typeName) {
      return typeName ? this.symbol === getOriginSymbolOfNode(typeName) : false;
    },
  },
};

const { hasOwn } = Object;

export const setDeclarations = () => {
  const file = host.program.getSourceFileByPath(PATH_LIB + 'index.d.ts');

  for (const symbol of getExportsOfModule(file)) {
    const name = symbol.name;

    if (hasOwn(typeNames, name)) {
      types.set(symbol, symbol);
      typeNames[name].symbol = symbol;
    } else if (hasOwn(decors, name)) {
      decorators.set(symbol, decors[name]);
    } else if (symbol.valueDeclaration) {
      declarations.set(symbol, {
        url: toRuntimeUrl(symbol.valueDeclaration.getSourceFile().resolvedPath),
      });
    }
  }
};
