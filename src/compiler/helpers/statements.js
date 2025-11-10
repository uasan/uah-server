import { host } from '../host.js';

export const factoryStatement = node =>
  host.factory.createExpressionStatement(node);

export const factoryTryStatement = (tryStatements, varError, catchStatements) =>
  host.factory.createTryStatement(
    host.factory.createBlock(tryStatements, true),
    host.factory.createCatchClause(
      host.factory.createVariableDeclaration(
        varError,
        undefined,
        undefined,
        undefined,
      ),
      host.factory.createBlock(catchStatements, true),
    ),
    undefined,
  );
