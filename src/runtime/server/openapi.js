import { presets } from '#env';
import { toCamelCase } from '#utils/string.js';
import { baseURI, routes } from './constants.js';
import { getRuleAsObject } from './validate.js';

const mapTypes = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'array',
};

const getTypeSchema = ({ type, items }) => ({
  type: mapTypes[type] ?? 'string',
  format: mapTypes[type] ? undefined : type,
  items: items && getTypeSchema({ type: items.type ?? items }),
});

const toExampleValue = (object, value) => {
  object[value] = { value, summary: value, type: 'string', format: 'string' };
  return object;
};

const getParameter = (rule, key, name) => {
  switch (rule.type) {
    case 'object':
    case 'array':
    case 'tuple': {
      let { type, items, props } = rule;

      if (items) {
        //let examples = items.values?.reduce(toExampleValue, {});
        items = getTypeSchema({ type: items.type ?? items });
      }

      return {
        name,
        in: key,
        content: {
          'application/json': {
            schema: { type, items, properties: props },
          },
        },
        required: !rule.optional,
      };
    }
    case 'enum':
      return {
        name,
        in: key,
        required: !rule.optional,
        schema: getTypeSchema(rule),
        examples: rule.values.reduce(toExampleValue, {}),
      };
    default:
      return {
        name,
        in: key,
        required: !rule.optional,
        schema: getTypeSchema(rule),
      };
  }
};

const getOperationId = (method, dirName, fileName) =>
  method + toCamelCase(dirName) + (fileName ? toCamelCase(fileName) : '');

const makeOpenAPI = () => {
  const paths = {};
  const data = {
    openapi: '3.0.0',
    info: {
      title: presets.app.id,
      version: process.env.APP_BUILD_VERSION ?? '',
    },
    servers: [
      {
        url: baseURI + '/{language}',
        variables: {
          language: {
            enum: ['~', ...presets.languages],
            default: 'en',
          },
        },
      },
    ],
    paths,
  };

  const responses = {
    200: {
      description: 'Successful Response',
      content: { 'application/json': {} },
    },
  };

  for (const route of routes.values()) {
    let path = '/' + route.basePath;
    let { description = '' } = route;

    const dirs = route.basePath.split('/');
    const operationId = getOperationId(route.methodName, dirs[1], dirs[2]);

    if (route.params?.path) {
      path += '/{' + Object.keys(route.params.path).join('}/{') + '}';
    }

    // let args = route.params
    //   ? '{ ' +
    //     Object.keys({
    //       ...route.params.path,
    //       ...route.params.query,
    //       ...route.params.body,
    //       ...route.params.files,
    //     }).join(', ') +
    //     ' }'
    //   : '';

    // description +=
    //   '```\n' + dirs[0] + '.' + operationId + '(' + args + ')\n```';

    paths[path] ??= {};

    const api = {
      tags: [dirs[0]],
      description,
      parameters: [],
      responses: route.response
        ? {
            200: {
              description: 'Successful Response',
              content: {
                [route.response.type]: {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          }
        : responses,
      operationId,
    };

    paths[path][route.methodName] = api;

    if (route.params) {
      for (const key of Object.keys(route.params)) {
        for (const name of Object.keys(route.params[key])) {
          const rule = getRuleAsObject(route.params[key][name]);

          switch (key) {
            case 'path':
            case 'query':
              api.parameters.push(getParameter(rule, key, name));
              break;

            case 'body':
            case 'files':
              {
                const contentType = route.params.files
                  ? 'multipart/form-data'
                  : 'application/json';

                api.requestBody ??= {
                  content: {
                    [contentType]: {
                      schema: {
                        type: 'object',
                        required: [],
                        properties: {},
                      },
                    },
                  },
                };

                const { required, properties } =
                  api.requestBody.content[contentType].schema;

                if (!rule.optional) required.push(name);

                properties[name] =
                  key === 'files'
                    ? {
                        type: 'string',
                        format: 'binary',
                      }
                    : getTypeSchema(rule);
              }
              break;
          }
        }
      }
    }
  }

  data.paths = Object.fromEntries(
    Object.entries(paths).sort((a, b) => a[0].localeCompare(b[0]))
  );

  return data;
};

export const getOpenapiJSON = response => {
  response
    .writeHeader('cache-control', 'no-cache')
    .writeHeader('content-type', 'application/json')
    .end(JSON.stringify(makeOpenAPI()));
};

export const getOpenapiUI = response => {
  response
    .writeHeader('cache-control', 'no-cache')
    .writeHeader('content-type', 'text/html; charset=utf-8')
    .end(`<!DOCTYPE html>
      <html>
      <head>
      <title>Swagger UI - ${presets.app.id}</title>
      <link type="text/css" rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css">
      </head>
      <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js" crossorigin></script>
      <script>window.ui = SwaggerUIBundle({
        url: "${baseURI}/openapi.json", 
        displayRequestDuration: true,
        tryItOutEnabled: true,
        deepLinking: true,
        docExpansion: 'none',
        presets: [SwaggerUIBundle.presets.apis],
        dom_id: "#swagger-ui"})</script>
      </body>
      </html>`);
};
