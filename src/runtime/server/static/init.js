import { readdir } from 'node:fs/promises';
import { types } from './types.js';

export async function initStaticServer(server) {
  const dir = server.static.path;

  for (const entry of await readdir(dir, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (entry.isFile()) {
      const ext = entry.name.slice(entry.name.lastIndexOf('.') + 1);

      if (Object.hasOwn(types, ext)) {
        const path = entry.parentPath + '/' + entry.name;
        const route = types[ext].init(path);
        const baseUrl = entry.parentPath.slice(dir.length) + '/';

        server.app.get(baseUrl + entry.name, route);

        if (entry.name === 'index.html') {
          server.app.get(baseUrl, route);
        }
      }
    }
  }
}
