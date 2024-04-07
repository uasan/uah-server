import { hasOwn, isArray, isObject } from '../../../types/checker.js';
import { errorNotArray, errorNotObject } from './errors.js';

export const isRelations = ({ model }, key) => hasOwn(model.relations, key);

function setMap({ relations }, model, name, rows, entry) {
  if (relations.has(model)) {
    const rel = relations.get(model);

    rel.entries.push(entry);

    if (rel.patch[name]) {
      rel.patch[name] = [...rel.patch[name], ...rows];
    } else {
      rel.patch[name] = rows;
    }
  } else {
    relations.set(model, {
      entries: [entry],
      patch: { [name]: rows },
    });
  }
}

function setPrimaryFields(values) {
  const { keys, rows } = this;
  const value = values[this.index];

  for (let i = 0; i < rows.length; i++) {
    for (const key in keys) {
      rows[i][key] = value[keys[key]];
    }
  }
}

function setPath(path, keys, value, primary) {
  for (let i = 0; i < primary.length; i++)
    if (hasOwn(keys, primary[i])) {
      path.splice(i, 0, value[keys[primary[i]]]);
    }
}

function setPrimaryValues(values) {
  const value = values[this.index];
  const { keys, rows, primary } = this;

  for (const path of rows) {
    if (!isArray(path)) {
      throw errorNotArray('path');
    }
    setPath(path, keys, value, primary);
  }
}

function setPrimaryPath(values) {
  const value = values[this.index];
  const { keys, rows, primary } = this;

  for (const { path } of rows) {
    if (!isArray(path)) {
      throw errorNotArray('path');
    }
    setPath(path, keys, value, primary);
  }
}

export function addRelation(patch, key, rows) {
  if (!isArray(rows)) {
    throw errorNotArray(key);
  }

  const { model, keys } = patch.model.relations[key];

  setMap(patch, model, 'add', rows, {
    rows,
    keys,
    set: setPrimaryFields,
    index: patch.queries.length,
  });
}

export function setRelation(patch, key, subPatch) {
  if (!isObject(subPatch)) {
    throw errorNotObject(key);
  }

  const { model, keys } = patch.model.relations[key];

  if (subPatch.delete) {
    const rows = subPatch.delete;
    setMap(patch, model, 'delete', rows, {
      rows,
      keys,
      set: setPrimaryValues,
      index: patch.queries.length,
      primary: model.table.primary,
    });
  }

  if (subPatch.set) {
    const rows = subPatch.set;
    setMap(patch, model, 'set', rows, {
      rows,
      keys,
      set: setPrimaryPath,
      index: patch.queries.length,
      primary: model.table.primary,
    });
  }

  if (subPatch.add) {
    addRelation(patch, key, subPatch.add);
  }
}
