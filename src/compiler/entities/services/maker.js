import { host, metaSymbols } from '#compiler/host.js';
import { DIR_BIN } from '#config';

export const services = new Map();

export function makeBinService() {
  let source = '';
  let awaits = '';

  for (const [symbol, entities] of services) {
    if (entities.size) {
      const { url, className } = metaSymbols.get(symbol);

      source += `import { ${className} } from '../${url}';\n`;
      awaits += `await ${className}.start();\n`;

      for (const entity of entities) {
        source += `import '../${entity.url}';\n`;
      }
    }
  }

  source += '\n' + awaits;

  host.hooks.saveFile(DIR_BIN + '/service.js', source);
}
