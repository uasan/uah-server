import ts from 'typescript';

import { factoryClassStaticBlock } from '../../helpers/class.js';
import { afterEmit, host, transformers } from '../../host.js';
import { factoryString } from '../../helpers/expression.js';
import { factoryRouteFunction } from '../../helpers/function.js';
import { internals } from '../../helpers/internals.js';
import { makeRouteStatements } from './handler.js';

const { MethodDeclaration } = ts.SyntaxKind;

const methods = new Map()
  .set('get', factoryString('get'))
  .set('put', factoryString('put'))
  .set('post', factoryString('post'))
  .set('delete', factoryString('del'));

const routes = new Set();

function makeImportRoutes() {
  let source = '';

  for (const { url } of routes) {
    source += `import './${url}';\n`;
  }

  host.hooks.saveFile('api.js', source);
}

function addRouteMethod(node) {
  return internals.setRoute(
    methods.get(node.name.escapedText),
    factoryString(host.entity.routePath),
    factoryRouteFunction(makeRouteStatements(node))
  );
}

function setRouteClassDeclaration(node) {
  const statements = [];
  const { members } = node;

  for (let i = 0; i < members.length; i++) {
    switch (members[i].kind) {
      case MethodDeclaration:
        if (methods.has(members[i].name.escapedText))
          statements.push(addRouteMethod(members[i]));

        break;
    }
  }

  //console.info(statements);

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
