export function getCookie(context, name = this.name) {
  return context.cookies.get(name);
}

export function setCookie(context, value, { name, options } = this) {
  context.cookies.set(name, value, { ...options });
}

export function deleteCookie(context, { name, options } = this) {
  context.cookies.set(name, '', { ...options, maxAge: 0 });
}

export const cookie = {
  uid: {
    name: 'UID',
    options: {
      httpOnly: false,
      sameSite: 'strict',
    },
    get: getCookie,
    set: setCookie,
    delete: deleteCookie,
  },
  token: {
    name: 'ACCESS_TOKEN',
    options: {
      httpOnly: true,
      sameSite: 'strict',
    },
    get: getCookie,
    set: setCookie,
    delete: deleteCookie,
  },
  refreshToken: {
    name: 'REFRESH_TOKEN',
    options: {
      httpOnly: true,
      sameSite: 'strict',
    },
    get: getCookie,
    set: setCookie,
    delete: deleteCookie,
  },
  lang: {
    name: 'LANG',
    options: {
      httpOnly: false,
      maxAge: 31_536_000,
    },
    get: getCookie,
    set: setCookie,
    delete: deleteCookie,
  },
};

export const deleteAuthCookies = context => {
  deleteCookie(context, cookie.uid);
  deleteCookie(context, cookie.token);
  deleteCookie(context, cookie.refreshToken);
};
