import { normalizeText } from '#utils/string.js';
import { nullObject } from '#utils/native.js';
import { SQL } from '../sql.js';

export function tsQuery(text, { strict = false } = nullObject) {
  text = text?.trim?.();

  if (text) {
    const prefix = strict ? '' : ':*';

    text = normalizeText(text)
      .toLowerCase()
      .replace(/'/g, `\\'`)
      .replace(/\\/g, '\\\\')
      .replace(/\s+/g, `' & '`);

    return new SQL(['', '::tsquery'], [`'` + text + `'` + prefix]);
  }
}
