import { presets } from '#env';
import { NotFound } from '../exceptions/NotFound.js';
import { factoryAccess } from '../security/access.js';
import { stringify } from '../utils/native.js';
import { setValidate } from './validate.js';
import { getMetaRespond } from './meta.js';

const respondDefault = (context, payload, data, id) => ({ id, data });
const getRespond = ({ meta }) => {
  return meta ? getMetaRespond(meta) : respondDefault;
};

export const setContext = context => {
  const { lang } = context;
  const isMultiLang = lang[0] === '~';
  const language = isMultiLang ? lang.slice(1) || presets.language : lang;

  if (!context.languages.includes(language)) {
    throw new NotFound(`Not found language: ${lang}`);
  }

  context.lang = language;
  context.language = language;
  context.isMultiLang = isMultiLang;

  return context;
};

export async function method(context, payload, id) {
  const { action, checkAccess } = this;

  context.route = this;
  context.payload = payload;

  this.validate(payload);

  const isAccess = await checkAccess(context, payload, this.isSafeMethod);
  const data = await action(context, payload);
  if (!isAccess) await checkAccess(context, data);

  if (data != null) {
    context.status = 200;

    if (data.constructor === Buffer) {
      context.type ||= 'json';
      context.body = data;
    } else {
      context.type = 'json';
      context.body = stringify(await this.respond(context, payload, data, id));
    }
  } else if (context.body || context.stream) {
    context.status = 200;
  }

  return context;
}

export const makeHandler = (routes, name) => {
  const route = routes[name];

  if (!route) {
    throw new Error(`Method "${name}" Not Implemented`);
  }

  if (typeof route.action !== 'function') {
    throw new Error(`Endpoint action is not function`);
  }

  route.method = method;
  route.methodName = name;

  route.respond = getRespond(route);
  route.checkAccess = factoryAccess(route.access);

  route.isSafeMethod = name === 'get';
  route.isBodyParams = !!route.params?.body || !!route.params?.files;

  setValidate(route);

  return route;
};
