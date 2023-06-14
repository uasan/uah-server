export function parseCookies(map, header) {
  if (header) {
    const list = header.split('; ');

    for (let i = 0; i < list.length; i++) {
      const pos = list[i].indexOf('=');
      map.set(list[i].slice(0, pos), list[i].slice(pos + 1));
    }
  }
}

export function setCookie(name, value, options) {
  value = name + '=' + value;
  value += '; path=' + (options?.path || '/');

  if (options?.maxAge != null) {
    value += '; max-age=' + options.maxAge;
  } else if (options?.expires) {
    value += '; expires=' + options.expires.toGMTString();
  }

  if (options?.httpOnly) value += '; httponly';
  if (options?.sameSite) value += '; samesite=' + options.sameSite;

  return value;
}
