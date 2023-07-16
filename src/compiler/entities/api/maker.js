import ts from 'typescript';

import { afterEmit, host } from '../../host.js';
import { makeRouteMethod } from './handler.js';
import { methods } from './constants.js';
import { addTransformer } from '../../helpers/ast.js';
import { getExportsOfModule, isStaticKeyword } from '../../helpers/checker.js';
import { URL_LIB_RUNTIME } from '../../../config.js';

const { ClassDeclaration, MethodDeclaration } = ts.SyntaxKind;

const routes = new Set();

function makeImportRoutes() {
  let source = `import { Router } from '${URL_LIB_RUNTIME}server/router.js';\n`;

  source += 'await Promise.all([';

  for (const route of routes) {
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

const makeClass = node =>
  host.factory.updateClassDeclaration(
    node,
    node.modifiers,
    node.name,
    undefined,
    node.heritageClauses,
    [...node.members, ...host.entity.route.members]
  );

export function makeRoutePath({ url }) {
  const [moduleName, submoduleName, , filename] = url.slice(4, -3).split('/');
  return filename === 'index'
    ? moduleName + '/' + submoduleName
    : moduleName + '/' + submoduleName + '/' + filename;
}

const isContextClass = symbol =>
  symbol.valueDeclaration?.kind === ClassDeclaration;

export function addRoute({ route }, file) {
  if (routes.has(route)) {
    route.members.length = 0;
    route.methods.length = 0;
  } else {
    routes.add(route);
  }

  const node = getExportsOfModule(file).find(isContextClass).valueDeclaration;

  route.class = node.name?.escapedText ?? 'default';

  for (const member of node.members) {
    if (member.modifiers.some(isStaticKeyword)) {
      continue;
    } else if (member.kind === MethodDeclaration) {
      if (methods.has(member.name.escapedText))
        route.members.push(makeRouteMethod(member.name.escapedText, member));
    }
  }

  afterEmit.add(makeImportRoutes);
  addTransformer(node, makeClass);

  return file;
}

export function deleteRoute(entity) {
  routes.delete(entity.route);
  afterEmit.add(makeImportRoutes);
  return entity;
}
