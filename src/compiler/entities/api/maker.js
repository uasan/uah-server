import ts from 'typescript';

import { factoryClassStaticBlock } from '../../helpers/class.js';
import { afterEmit, host, transformers } from '../../host.js';
import { makeRouteMethod } from './handler.js';
import { methods } from './constants.js';

const { MethodDeclaration } = ts.SyntaxKind;

const routes = new Set();

function makeImportRoutes() {
  let source = '';

  for (const { url } of routes) {
    source += `import './${url}';\n`;
  }

  host.hooks.saveFile('api.js', source);
}

function setRouteClassDeclaration(node) {
  const statements = [];
  const { members } = node;

  for (const member of members) {
    switch (member.kind) {
      case MethodDeclaration:
        if (methods.has(member.name.escapedText))
          statements.push(makeRouteMethod(member.name.escapedText, member));

        break;
    }
  }

  return host.factory.updateClassDeclaration(
    node,
    node.modifiers,
    node.name,
    undefined,
    node.heritageClauses,
    [...node.members, factoryClassStaticBlock(statements)]
  );
}

export function makeRoutePath({ url }) {
  const [moduleName, submoduleName, , filename] = url.slice(4, -3).split('/');
  return filename === 'index'
    ? moduleName + '/' + submoduleName
    : moduleName + '/' + submoduleName + '/' + filename;
}

export function addRoute(entity, file) {
  if (routes.has(entity) === false) {
    routes.add(entity);
    afterEmit.add(makeImportRoutes);
  }

  transformers.set(
    host.checker.getExportsOfModule(file.symbol)[0].valueDeclaration,
    setRouteClassDeclaration
  );

  return file;
}

export function deleteRoute(entity) {
  routes.delete(entity);
  afterEmit.add(makeImportRoutes);
  return entity;
}
