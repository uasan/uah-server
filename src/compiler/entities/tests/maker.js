import { factoryCallThisMethod } from '#compiler/helpers/call.js';
import {
  getOriginSymbolClass,
  getTypeOfNode,
} from '#compiler/helpers/checker.js';
import { addToStaticProperty } from '#compiler/helpers/class.js';
import { factoryIdentifier } from '#compiler/helpers/expression.js';
import { factoryArrayLiteral } from '#compiler/helpers/object.js';
import { host, metaSymbols, Unlinks } from '#compiler/host.js';
import { DIR_BIN, URL_LIB_RUNTIME } from '#config';
import { getTestURL, isTestMethod, setParentTests } from './payload.js';

const tests = new Map();

function makeBinTest() {
  let source = `import '${URL_LIB_RUNTIME}process.js';\n\n`;
  let awaits = '';

  for (const [symbol, entities] of tests) {
    if (entities.size) {
      const { url, className } = metaSymbols.get(symbol);

      awaits += `await (await import('../${url}')).${className}.run();\n`;

      for (const entity of entities) {
        source += `import '../${entity.url}';\n`;
      }
    }
  }

  source += '\n' + awaits;

  host.hooks.saveFile(DIR_BIN + '/test.js', source);
}

export function TestContext(node, { symbol, meta }) {
  const { entity } = host;

  if (entity.isContext) {
    const relations = new Set();

    metaSymbols.set(symbol, {
      relations,
      url: entity.url,
      className: node.name.escapedText,
    });

    entity.unlinks ??= new Unlinks(makeBinTest);
    entity.unlinks.set(symbol, tests.set(symbol, relations));

    return addToStaticProperty(
      host.visitEachChild(node),
      factoryIdentifier('list'),
      factoryArrayLiteral(),
    );
  } else if (entity.isTest) {
    const method = node.members.find(isTestMethod);

    if (method) {
      const args = [getTestURL(entity, method)];

      entity.unlinks ??= new Unlinks(makeBinTest);
      entity.unlinks.set(entity, meta.relations.add(entity));

      if (method.parameters.length) {
        setParentTests(args, getTypeOfNode(method.parameters[0]));
      }

      metaSymbols.set(getOriginSymbolClass(node), entity);

      return addToStaticProperty(
        host.visitEachChild(node),
        factoryIdentifier('meta'),
        factoryCallThisMethod(factoryIdentifier('add'), args),
      );
    } else {
      return host.visitEachChild(node);
    }
  } else {
    return host.visitEachChild(node);
  }
}
