import { hasOwn } from '../../../types/checker.js';

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

function setPrimaryValues(values) {
  const { keys, rows } = this;
  const value = values[this.index];

  for (let i = 0; i < rows.length; i++) {
    for (const key in keys) {
      rows[i][keys[key]] = value[key];
    }
  }
}

export function addRelation(patch, key, value) {
  const rows = value[key];
  const { model, keys } = patch.model.relations[key];

  setMap(patch, model, 'add', rows, {
    rows,
    keys,
    set: setPrimaryValues,
    index: patch.queries.length,
  });
}
