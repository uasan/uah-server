import { SQL } from '../sql.js';

export function intl(
  name,
  {
    json = false,
    language = this.context.language,
    languages = this.context.languages,
    isMultiLang = this.context.isMultiLang,
  } = {}
) {
  const operator = json ? '->' : '->>';

  let sql = name;

  if (!isMultiLang) {
    sql = `coalesce(${name}${operator}'${language}'`;

    for (let i = 0; i < languages.length; i++)
      if (languages[i] !== language) {
        sql += `, ${name}${operator}'${languages[i]}'`;
      }

    sql += ')';
  }

  return new SQL([sql]);
}
