import { factoryNew } from '#compiler/helpers/call.js';
import { addToStaticProperty } from '#compiler/helpers/class.js';
import { factoryIdentifier, factoryThis } from '#compiler/helpers/expression.js';
import { host, metaSymbols, Unlinks } from '#compiler/host.js';
import { makeBinService, services } from '../services/maker.js';

export function SchedulerContext(node, { symbol, meta }) {
  const { entity } = host;

  if (entity.isContext) {
    const relations = new Set();

    metaSymbols.set(symbol, {
      relations,
      url: entity.url,
      className: node.name.escapedText,
    });

    entity.unlinks ??= new Unlinks(makeBinService);
    entity.unlinks.set(symbol, services.set(symbol, relations));

    return host.visitEachChild(node);
  } else if (entity.isScheduler) {
    entity.unlinks ??= new Unlinks(makeBinService);
    entity.unlinks.set(entity, meta.relations.add(entity));

    return addToStaticProperty(host.visitEachChild(node), factoryIdentifier('instance'), factoryNew(factoryThis()));
  } else {
    return host.visitEachChild(node);
  }
}
