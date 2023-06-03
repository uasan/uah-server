import { Conflict } from '../exceptions/Conflict.js';
import { Forbidden } from '../exceptions/Forbidden.js';
import { UnProcessable } from '../exceptions/UnProcessable.js';
import { allowOwner, allowAdmin } from '../security/access.js';
import { create, toArray, isObject, hasOwnProperty } from '../utils/native.js';
import { makeError } from './utils/errors.js';
import { makeValidator } from './patch/validate.js';

const PARENT = Symbol('Parent');

const METHOD_NAMES = {
  add: 'create',
  replace: 'update',
  remove: 'delete',
};

function setPayload(key, value, isId = false) {
  if (value !== undefined) {
    this.payload[key] = value;
  }

  if (isId) return;

  const permission = this.model.rules[key]?.access?.[this.method];
  if (permission) this.permissions.add(permission);

  if (this.model.validator?.result?.schema?.[key]) {
    this.isValidateResult = true;
  }

  if (this.methodHooks?.[key]) {
    const hookList = this.methodHooks[key];

    if (this.hooks) {
      this.hooks.push(...hookList);
    } else {
      this.hooks = [...hookList];
    }
  }
}

export class Patches {
  relations;
  values = [];
  entries = [];
  queries = [];
  returning = [];
  tree = create(null);

  constructor(model, patches) {
    if (!patches || !patches.length) {
      throw new UnProcessable('Empty patches array');
    }

    const keys = toArray(model.idColumn);
    model.validator ??= makeValidator(model.rules);

    this.keys = keys;
    this.model = model;
    this.keysLength = keys.length;

    const { rules } = model;
    const { length } = patches;
    const plainLevel = this.keysLength + 1;

    for (let i = 0; i < length; i++) {
      const patchParams = patches[i];
      const { op, path, value } = patchParams;

      if (!path) {
        throw new UnProcessable(`Path missing`);
      }

      const key = path[this.keysLength];

      if (key === undefined) {
        this.adds(patchParams);
      } else if (hasOwnProperty.call(rules, key)) {
        if (path.length === plainLevel) {
          const entry = this.get(path) || this.add(patchParams);

          entry.values[key] = value;
          entry.setPayload(key, value);
        } else {
          const entry =
            (i && this.get(path)) ||
            this.add({ ...patchParams, op: 'replace' });

          entry.setPayload(key);

          if (!entry.patches) {
            entry.patches = create(null);
            entry.patches[key] = [];
          } else if (!entry.patches[key]) {
            entry.patches[key] = [];
          }

          entry.patches[key].push({
            op,
            value,
            path: path.slice(plainLevel),
          });
        }
      } else if (model.relations?.[key]?.model) {
        this.setRelationEntry(model.relations[key], value, patchParams);
      } else {
        //throw new UnProcessable(`Invalid path "${key}"`);
      }
    }
  }

  queryInsert({ resultIndex, payload }) {
    if (this.model.rules.created_uid) {
      payload.created_uid = this.context.uid;
    }
    if (this.model.rules.updated_uid) {
      payload.updated_uid = this.context.uid;
    }

    const names = Object.keys(payload);

    const indexes = [];
    const { tableName } = this.model;

    for (const name of names) {
      indexes.push(this.values.push(payload[name]));
    }

    this.queries.push(
      `INSERT INTO ${tableName} ("${names.join(
        '", "'
      )}") VALUES($${indexes.join(', $')})${resultIndex ? ' RETURNING *' : ''}`
    );
  }

  queryUpdate({ id, values, patches, resultIndex }) {
    const ids = [];
    const set = ['updated_at=CURRENT_TIMESTAMP'];
    const { tableName, rules } = this.model;

    if (rules.updated_uid) {
      values.updated_uid = this.context.uid;
    }

    for (const name of Object.keys(id)) {
      const index = this.values.push(id[name]);
      ids.push(`"${name}" = $${index}`);
    }

    for (const name of Object.keys(values)) {
      const value = values[name];
      const index = this.values.push(value);
      set.push(`"${name}"=$${index}`);
    }

    if (patches) {
      for (const name of Object.keys(patches)) {
        let target = `"target"."${name}"`;
        const isArray = rules[name]?.type?.endsWith(']');

        if (isArray) {
          target = `to_jsonb(${target})`;
        }

        const removes = [];

        for (const { op, path, value } of patches[name]) {
          const index = this.values.push(path);

          if (op === 'remove') {
            removes.push({
              sql: ` #-$${index}`,
              index: +path[path.length - 1],
            });
          } else {
            target = `jsonb_set(${target},$${index}::text[],coalesce($${this.values.push(
              this.context.db.json(value)
            )}::jsonb, 'null'::jsonb))`;
          }
        }

        if (removes.length) {
          target += removes
            .sort((a, b) => (a.index > b.index ? -1 : 1))
            .map(({ sql }) => sql)
            .join('');
        }

        if (isArray) {
          target = `array(SELECT jsonb_array_elements_text(${target}))::${rules[name].type}`;
        }

        set.push(`"${name}"=${target}`);
      }
    }

    if (resultIndex) {
      const where = Object.keys(id)
        .map(
          (name, i) =>
            `"target".${ids[i]} AND "source".${name} = "target".${name}`
        )
        .join(' AND ');

      this.queries.push(
        `UPDATE ${tableName} AS "target"
          SET ${set.join(', ')}
          FROM ${tableName} AS "source"
          WHERE ${where}
          RETURNING "target".*, to_json("source".*) AS "__source__"`
      );
    } else {
      this.queries.push(
        `UPDATE ${tableName} AS "target" SET ${set.join(', ')} WHERE ${ids.join(
          ' AND '
        )}`
      );
    }
  }

  queryDelete({ id, resultIndex }) {
    const ids = [];
    for (const name of Object.keys(id)) {
      ids.push(`"${name}" = $${this.values.push(id[name])}`);
    }
    this.queries.push(
      `DELETE FROM ${this.model.tableName} WHERE ${ids.join(' AND ')}${
        resultIndex ? ' RETURNING *' : ''
      }`
    );
  }

  add({ op, path, [PARENT]: parent }) {
    const id = { ...parent?.ids };
    const payload = { ...id };
    const { model, keys } = this;
    const method = METHOD_NAMES[op];

    const entry = {
      id,
      model,
      method,
      payload,
      values: {},
      setPayload,
      resultIndex: 0,
      isValidateResult: false,
      parent: parent || this.model.parent,
      permissions: new Set(),
      methodHooks: model.hooks?.[method],
      modelAccess: model.access?.[method],
    };

    if (!entry.modelAccess) {
      const parentAccess = parent?.method
        ? parent?.model?.access[parent?.method]
        : parent?.model?.access.update;

      if (parentAccess) {
        entry.modelAccess = parentAccess;
      } else if (model.rules.uid) {
        entry.modelAccess = allowOwner;
      } else {
        entry.modelAccess = allowAdmin;
      }
    }

    for (let i = 0, map = this.tree; ; ) {
      const key = keys[i];
      const value = path[i];

      if (value == null) {
        throw new UnProcessable(`Invalid "${key}" value`);
      }

      id[key] = value;
      entry.setPayload(key, value, method === 'update');

      if (++i === this.keysLength) {
        map[value] = entry;
        break;
      } else {
        map = map[value] ?? (map[value] = create(null));
      }
    }

    this.entries.push(entry);
    return entry;
  }

  setRelationEntry(relation, value, { op, path }) {
    const { keys } = this;
    const relMap = relation.using;
    const patch = {
      op,
      value,
      path: [],
      [PARENT]: {
        ids: {},
        model: this.model,
        using: relMap,
        method: this.get(path)?.method,
      },
    };

    const relKeys = toArray(relation.model.idColumn);

    for (const key of Object.keys(relMap)) {
      const name = relMap[key];
      const index = relKeys.indexOf(name);
      const value = path[keys.indexOf(key)];

      if (index === -1) {
        patch[PARENT].ids[name] = value;
      } else {
        patch.path[index] = value;
      }
    }

    let n = this.keysLength + 1;
    for (let i = 0; i < relKeys.length; i++) {
      if (n < path.length) {
        patch.path[i] ??= path[n++];
      }
    }

    if (n < path.length) {
      patch.path.push(...path.slice(n));
    }
    if (!this.relations) {
      this.relations = new Map();
    }

    if (this.relations.has(relation.model)) {
      this.relations.get(relation.model).push(patch);
    } else {
      this.relations.set(relation.model, [patch]);
    }
  }

  filterFields(entry, patch) {
    const { value } = patch;
    const { rules, relations } = this.model;

    for (const key of Object.keys(value))
      if (relations?.[key]?.model) {
        this.setRelationEntry(relations[key], value[key], patch);
      } else if (hasOwnProperty.call(rules, key)) {
        if (hasOwnProperty.call(entry.id, key) === false) {
          entry.setPayload(key, value[key]);
        }
      }
  }

  adds(patch) {
    if (this.keysLength === patch.path.length) {
      const entry = this.add(patch);

      if (patch.value) {
        this.filterFields(entry, patch);
      }
    } else if (isObject(patch.value))
      for (const key of Object.keys(patch.value)) {
        this.adds({
          ...patch,
          path: [...patch.path, key],
          value: patch.value[key],
        });
      }
    else {
      throw new UnProcessable(`Values missing from path`);
    }
  }

  get(path) {
    let i = 0;
    let entry = this.tree;

    do {
      entry = entry[path[i]];
    } while (entry && ++i < this.keysLength);

    return entry;
  }

  setReturning(entry) {
    if (entry.resultIndex === 0) {
      const index = this.queries.length;
      let { parent } = entry;

      if (parent) {
        let num = 0;
        let join = '';
        let select = '';
        let relation = `"${index}"`;

        do {
          num++;
          const { using } = parent;
          const { tableName } = parent.model;

          const on = Object.keys(using)
            .map(key => `${relation}."${using[key]}"=_${num}."${key}"`)
            .join(', ');

          relation = '_' + num;
          join += ` JOIN ${tableName} _${num} ON ${on}`;
          select += `to_jsonb(_${num}.*) || `;
        } while ((parent = parent.model?.parent));

        entry.resultIndex = this.returning.length + 1;
        this.returning.push(
          `(SELECT ${select}to_jsonb("${index}".*) AS "${entry.resultIndex}" FROM "${index}"${join})`
        );
      } else {
        entry.resultIndex = this.returning.length + 1;
        this.returning.push(
          `(SELECT to_json("${index}".*) AS "${entry.resultIndex}" FROM "${index}")`
        );
      }
    }
    return entry;
  }

  async apply(context, payload) {
    this.context = context;
    const { entries, queries } = this;

    const query = {
      text: '',
      values: this.values,
    };

    const hookMap = new Map();
    const checkEntries = [];
    const validateEntities = [];

    for (const entry of entries) {
      const { id, hooks, permissions } = entry;

      if (entry.isValidateResult) {
        validateEntities.push(this.setReturning(entry));
      }

      if (permissions.size === 0) permissions.add(entry.modelAccess);

      for (const permission of permissions)
        if ((await permission(context, id, true)) !== true)
          checkEntries.push(this.setReturning(entry));

      if (hooks) {
        const { resultIndex } = this.setReturning(entry);
        for (const hook of hooks) {
          const indexes = hookMap.get(hook);

          if (!indexes) {
            hookMap.set(hook, [resultIndex]);
          } else if (!indexes.includes(resultIndex)) {
            indexes.push(resultIndex);
          }
        }
      }

      if (entry.method === 'create') {
        this.queryInsert(entry);
      } else if (entry.method === 'update') {
        this.queryUpdate(entry);
      } else {
        this.queryDelete(entry);
      }
    }

    if (queries.length === 1 && this.returning.length === 0) {
      query.text = queries[0];
    } else {
      query.text += `WITH "0" AS (${queries[0]})`;

      for (let index = 1; index < entries.length; index++) {
        query.text += `,\n"${index}" AS(${queries[index]})\n`;
      }

      if (this.returning.length) {
        query.text += '\nSELECT ' + this.returning.join(',\n');
      } else {
        query.text += `SELECT 0`;
      }
    }

    // console.log(entries);
    // console.log('\n', query.text, '\n', query.values);

    let result;
    try {
      result = (await context.db.unsafe(query.text, query.values))?.[0];
    } catch (error) {
      const type = error?.constraint_name;
      if (type) {
        throw Conflict.from(error).putErrors([
          {
            type,
            code: error.code,
            message: error.detail || error.message,
          },
        ]);
      } else {
        throw makeError(error);
      }
    }

    if (validateEntities.length) {
      for (const { resultIndex } of validateEntities) {
        this.model.validator.result.validate(result[resultIndex]);
      }
    }

    for (const { resultIndex, permissions } of checkEntries) {
      const entity = result[resultIndex];

      if (!entity) {
        throw new Conflict(`Not found entity`);
      }

      const origin = { ...entity, ...entity.__source__ };

      for (const permission of permissions)
        if ((await permission(context, origin)) !== true)
          throw new Forbidden('Access denied');
    }

    for (const [hook, indexes] of hookMap) {
      const entities = indexes
        .map(index => result[index] ?? false)
        .filter(Boolean);

      if (entities.length) {
        await hook(context, { entities, payload });
      }
    }
  }

  async execute(context, payload) {
    if (this.entries.length) {
      await this.apply(context, payload);
    }

    if (this.relations) {
      for (const [model, patches] of this.relations) {
        await new Patches(model, patches).execute(context, payload);
      }
    }
  }
}
