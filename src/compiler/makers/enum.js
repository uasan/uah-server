import { factoryNumber } from '../helpers/expression.js';
import { factoryObjectLiteral, factoryProperty } from '../helpers/object.js';
import { getLiteralValue } from '../helpers/types.js';
import { factoryConstant, filterModifiers } from '../helpers/var.js';

export function makeEnumDeclaration({ name, modifiers, members }) {
  const properties = [];

  for (let i = 0; i < members.length; i++) {
    properties.push(
      factoryProperty(
        members[i].name,
        members[i].initializer
          ? getLiteralValue(members[i].initializer)
          : factoryNumber(i)
      )
    );
  }

  return factoryConstant(
    name,
    factoryObjectLiteral(properties),
    modifiers?.filter(filterModifiers)
  );
}
