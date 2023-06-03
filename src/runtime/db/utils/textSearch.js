export const LOCALES = {
  en: 'english',
  de: 'german',
  fr: 'french',
  it: 'italian',
  fi: 'finnish',
  ru: 'russian',
  __proto__: null,
};

export const getLocaleName = lang => LOCALES[lang] ?? 'simple';

export const getSearchQuery = (text, param = ':* &') =>
  text
    .trim()
    .replace(/'/g, `''`)
    .replace(/\\/g, '')
    .replace(/\s+/g, `'${param} '`);
