import ts from 'typescript';

import { factoryNumber } from '../helpers/expression.js';
import { factoryObjectLiteral, factoryProperty } from '../helpers/object.js';
import { factoryConstant } from '../helpers/var.js';
import { getConstantLiteral } from '../helpers/expression.js';
import { host } from '../host.js';
import { isNativeModifier } from '../helpers/checker.js';

const { StringLiteral, NumericLiteral } = ts.SyntaxKind;

function getLiteralInitializer(node) {
  switch (node.kind) {
    case StringLiteral:
    case NumericLiteral:
      return node;
  }
  return getConstantLiteral(node.parent) ?? host.visit(node);
}

export function makeEnumDeclaration({ name, modifiers, members }) {
  const properties = [];

  for (let i = 0; i < members.length; i++) {
    properties.push(
      factoryProperty(
        members[i].name,
        members[i].initializer
          ? getLiteralInitializer(members[i].initializer)
          : factoryNumber(i)
      )
    );
  }

  return factoryConstant(
    name,
    factoryObjectLiteral(properties),
    modifiers?.filter(isNativeModifier)
  );
}
