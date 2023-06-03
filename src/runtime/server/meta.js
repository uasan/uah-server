import { isArray } from '#utils/native.js';

const getAccessName = (ns, name) => (ns ? ns + '_' + name : name);

const setMapPermissions = (map, permissions, ns = '') => {
  if (permissions)
    for (const name of Object.keys(permissions)) {
      const permission = permissions[name];
      const key = getAccessName(ns, name);

      if (map.has(permission)) map.get(permission).push(key);
      else map.set(permission, [key]);
    }
};

const makeMapPermissions = (model, map, ns = '') => {
  setMapPermissions(map, model.access, ns);

  if (model.rules)
    for (const name of Object.keys(model.rules))
      setMapPermissions(map, model.rules[name].access, getAccessName(ns, name));

  if (model.relations)
    for (const name of Object.keys(model.relations))
      makeMapPermissions(
        model.relations[name].model,
        map,
        getAccessName(ns, name)
      );

  return map;
};

const respondAccess = async (context, entity, map) => {
  const access = {};

  for (const [permission, keys] of map) {
    const result = await permission(context, entity, true);
    for (const key of keys) access[key] = result;
  }

  return access;
};

export const getMetaRespond = meta => {
  if (meta.access) {
    const map = makeMapPermissions(meta.access, new Map());

    const respond = async (context, payload, data, id) => ({
      id,
      data,
      meta: {
        access: await respondAccess(
          context,
          isArray(data) ? payload : data,
          map
        ),
      },
    });

    return respond;
  }
};
