import { fs } from '../utils/native.js';
import { CWD } from '../utils/location.js';

const mapVars = Object.assign(Object.create(null), {
  _uid: context => context.uid,
  _lang: context => context.language,
});

const getValues = (context, payload, params) => {
  const values = [];

  for (let i = 0; i < params.length; i++) {
    const name = params[i];
    values[i] = mapVars[name]?.(context) ?? payload[name];
  }

  return values;
};

export const createAction =
  ({ text, params, returnMethod }) =>
  async (context, payload) =>
    returnMethod(
      await context.db.unsafe(text, getValues(context, payload, params))
    );

export const createActionFromFileSQL = ({ path: names }) => {
  let action = async (context, payload) => {
    const name = `${names[0]}/${names[1]}/${names[2]}`;
    const path = `${CWD}/src/app/${names[0]}/${names[1]}/sql/${names[2]}.sql`;

    const params = [];
    const source = (await fs.readFile(path, 'utf8')).split('${');

    for (let i = 1; i < source.length; i++) {
      const sql = source[i];
      const index = sql.indexOf('}');

      const key = sql.slice(0, index).trim();
      const num = params.includes(key)
        ? params.indexOf(key) + 1
        : params.push(key);

      source[i] = '$' + num + sql.slice(index + 1);
    }

    action = createAction({
      name,
      params,
      text: source.join(''),
      returnMethod: res => res.rows,
    });

    return await action(context, payload);
  };

  return (context, payload) => action(context, payload);
};
