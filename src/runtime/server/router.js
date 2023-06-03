import { readdir } from 'fs/promises';
import { baseURI, routes } from './constants.js';
import { factoryHandler } from './request.js';
import { CWD } from '../utils/location.js';
import { keys, returnNullArray } from '#utils/native.js';
import { websocket } from './websocket.js';
import { getOpenapiUI, getOpenapiJSON } from './openapi.js';
import { checkHealth, checkDatabaseHealth } from './health.js';

export const root = CWD + '/src/app';

const wft = { withFileTypes: true };

const getBasePath = params => {
  const path = params.appName + '/' + params.apiName;
  return params.name === 'index' ? path : path + '/' + params.name;
};

const bindEndpoint =
  params =>
  ({ methods }) => {
    if (!methods) return;

    const basePath = getBasePath(params);
    const rootPath = baseURI + '/:lang/' + basePath;

    for (const name of keys(methods)) {
      const route = methods[name];

      route.basePath = basePath;
      route.name = name.toUpperCase() + '/' + basePath;

      routes.set(route.name, route);

      const path = route.params?.path
        ? rootPath + '/:' + keys(route.params.path).join('/:')
        : rootPath;

      //console.log(`${method}: ${path}`);
      params.router[name === 'delete' ? 'del' : name](
        path,
        factoryHandler(methods, name)
      );
    }
  };

const loadApiFiles = async ({ router, promises }, appName, apiName) => {
  const path = root + '/' + appName + '/' + apiName + '/api';

  for (const { name } of await readdir(path, wft).catch(returnNullArray)) {
    if (name.endsWith('.js'))
      promises.push(
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        import('file://' + path + '/' + name).then(
          bindEndpoint({ router, appName, apiName, name: name.slice(0, -3) })
        )
      );
  }
};

const loadAppFolders = async (params, appName) => {
  const path = root + '/' + appName;

  for (const dirent of await readdir(path, wft))
    if (dirent.isDirectory()) {
      params.promises.push(loadApiFiles(params, appName, dirent.name));
    }
};

export const bindEndpoints = async router => {
  const promises = [];
  const params = { router, promises };

  router
    .get(baseURI + '/docs', getOpenapiUI)
    .get(baseURI + '/openapi.json', getOpenapiJSON)
    .ws(baseURI + '/websocket/:lang', websocket)
    .get(baseURI + '/health-check', checkHealth)
    .get(baseURI + '/health-check-db', checkDatabaseHealth)
    .any('/*', (response, request) => {
      response
        .writeStatus('501')
        .writeHeader('cache-control', 'no-store')
        .writeHeader('content-type', 'application/json')
        .end(
          JSON.stringify({
            status: 501,
            errors: [
              {
                message: request.getUrl().includes('//')
                  ? 'Double slashes in url'
                  : 'Not Implemented',
              },
            ],
          })
        );
    });

  for (const dirent of await readdir(root, wft))
    if (dirent.isDirectory())
      promises.push(loadAppFolders(params, dirent.name));

  for (let i = 0; i < promises.length; i++) await promises[i];
};
