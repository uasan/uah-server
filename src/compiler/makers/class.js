import { host } from '../host.js';
import { filterModifiers } from '../helpers/var.js';

export const makePropertyDeclaration = node =>
  host.factory.updatePropertyDeclaration(
    node,
    node.modifiers?.filter(filterModifiers),
    node.name,
    undefined,
    undefined,
    node.initializer && host.visit(node.initializer)
  );
