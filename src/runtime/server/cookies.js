export function parseCookies(map, header) {
  if (header) {
    const list = header.split('; ');

    for (let i = 0; i < list.length; i++) {
      const pos = list[i].indexOf('=');

      if (pos !== -1) {
        map.set(list[i].slice(0, pos), list[i].slice(pos + 1));
      }
    }
  }
}

export function setCookie(options, value) {
  value = options.name + '=' + value;
  value += '; path=' + (options.path || '/');

  if (options.maxAge != null) {
    value += '; max-age=' + options.maxAge;
  } else if (options.expires) {
    value += '; expires=' + options.expires.toGMTString();
  }

  if (options.secure) value += '; secure';
  if (options.httpOnly) value += '; httponly';
  if (options.partitioned) value += '; partitioned';

  if (options.domain) value += '; domain=' + options.domain;
  if (options.sameSite) value += '; samesite=' + options.sameSite;

  this.headers.push('set-cookie', value);
}

export function deleteCookie(options) {
  this.setCookie({ ...options, maxAge: 0 }, '');
}
