import ts from 'typescript';
import { host } from '../host.js';

export const factoryClassStaticBlock = statements =>
  host.factory.createClassStaticBlockDeclaration(
    host.factory.createBlock(statements, true)
  );
