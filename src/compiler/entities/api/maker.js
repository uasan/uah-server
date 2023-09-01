import ts from 'typescript';

import { host } from '../../host.js';
import { makeRouteMethod } from './handler.js';
import { methods } from './constants.js';
import { URL_LIB_RUNTIME } from '../../../config.js';
import { updateClass } from '../../helpers/class.js';
import { isExportNode, isStaticKeyword } from '../../helpers/checker.js';
import { getNodeTextName } from '../../helpers/var.js';

const { MethodDeclaration } = ts.SyntaxKind;

export const routes = new Set();

export function makeImportRoutes() {
  let source = `import { Router } from '${URL_LIB_RUNTIME}server/router.js';\n`;

  source += 'await Promise.all([';

  for (const route of routes)
    if (route.methods.length) {
      source += `import ('./${route.url}').then(m => {`;

      for (const method of route.methods) {
        source += 'Router.set(';
        source += "'" + route.path + method.params + "',";
        source += 'm.' + route.class + '.' + method.name + ');';
      }

      source += '}),\n';
    }
  source += ']);';
  host.hooks.saveFile('api.js', source);
}

export function ServerContext(node) {
  const { route } = host.entity;

  if (!route || !isExportNode(node)) {
    return host.visitEachChild(node);
  }

  if (routes.has(route)) {
    route.methods.length = 0;
  }

  const members = [];

  route.class = getNodeTextName(node);

  for (const member of node.members) {
    if (
      member.kind === MethodDeclaration &&
      methods.has(member.name.escapedText) &&
      !member.modifiers.some(isStaticKeyword)
    )
      members.push(makeRouteMethod(member.name.escapedText, member));
  }

  node = host.visitEachChild(node);

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    ...node.members,
    ...members,
  ]);
}

export function makeRoutePath({ url }) {
  const [moduleName, submoduleName, , filename] = url.slice(4, -3).split('/');
  return filename === 'index'
    ? moduleName + '/' + submoduleName
    : moduleName + '/' + submoduleName + '/' + filename;
}
