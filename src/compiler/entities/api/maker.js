import ts from 'typescript';

import { factoryCallMethod } from '#compiler/helpers/call.js';
import { factoryIdentifier, factoryThis } from '#compiler/helpers/expression.js';
import { factoryPropertyAccess } from '#compiler/helpers/object.js';
import { getImplement } from '#compiler/makers/class.js';
import { HTTP } from '#compiler/makers/protocols/HTTP.js';
import { DIR_BIN, URL_LIB_RUNTIME } from '../../../config.js';
import { isStaticKeyword } from '../../helpers/checker.js';
import { factoryClassStaticBlock, updateClass } from '../../helpers/class.js';
import { host, metaSymbols, Unlinks } from '../../host.js';
import { services } from '../services/maker.js';

const { MethodDeclaration } = ts.SyntaxKind;

export const routes = new Map();

function setRouteAST(method, params) {
  this.routeAST ??= factoryPropertyAccess(
    factoryPropertyAccess(factoryThis(), factoryIdentifier('server')),
    factoryIdentifier('router'),
  );
  this.routeAST = factoryCallMethod(this.routeAST, factoryIdentifier(method), params);
}

export function ServerContext(node, extend) {
  const { entity } = host;

  if (!entity.isRoute || !extend.meta.isServer) {
    return host.visitEachChild(node);
  }

  const meta = {
    setRouteAST,
    routeAST: null,
    path: makeRoutePath(entity),
    protocol: getImplement(node) ?? HTTP,
    countRoutParams: extend.meta.countRoutParams,
  };

  const members = [];

  for (const member of node.members) {
    if (
      member.kind === MethodDeclaration
      && meta.protocol.methods.has(member.name.escapedText)
      && !member.modifiers?.some(isStaticKeyword)
    ) {
      meta.protocol.methods.get(member.name.escapedText).make(meta, members, member);
    }
  }

  if (meta.routeAST) {
    members.push(factoryClassStaticBlock([meta.routeAST]));

    entity.unlinks ??= new Unlinks(makeBinServer);
    entity.unlinks.set(entity, extend.meta.relations.add(entity));
  }

  node = host.visitEachChild(node);

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    ...node.members,
    ...members,
  ]);
}

export function makeRoutePath({ url }) {
  let [moduleName, submoduleName, , ...names] = url.slice(4, -3).split('/');

  if (names.at(-1) === 'index') {
    names = names.slice(0, -1);
  }

  return names.length
    ? moduleName + '/' + submoduleName + '/' + names.join('/')
    : moduleName + '/' + submoduleName;
}

export function makeBinServer() {
  let source = `import '${URL_LIB_RUNTIME}process.js';\n\n`;
  let awaits = '';

  if (services.size) {
    source += `import './service.js';\n`;
  }

  for (const [symbol, entities] of routes) {
    if (entities.size) {
      const { url, className } = metaSymbols.get(symbol);

      source += `import { ${className} } from '../${url}';\n`;
      awaits += `await ${className}.server.start();\n`;

      for (const entity of entities) {
        source += `import '../${entity.url}';\n`;
      }
    }
  }

  source += '\n' + awaits;

  host.hooks.saveFile(DIR_BIN + '/server.js', source);
}
