import { presets } from '#env';
import { randomUUID } from 'crypto';
import { setContext } from '#server/handler.js';
import { DEFAULT_USER } from '#security/auth/user.js';
import { Context as ContextServer } from '#server/context.js';
import { getBranchName } from './process.js';

export class Context extends ContextServer {
  constructor({ user = DEFAULT_USER, lang = presets.language, request } = {}) {
    super();

    this.lang = lang;
    this.user = user;
    this.uid = user.uid;
    this.request = request;

    this.expected = {};
    this.request = request;

    setContext(this);
  }
}

export const context = Context.prototype;

context.isRunAllTests = false;

export const createContext = async options => {
  presets.app.isTesting = true;

  options.isSafePoint ??= true;
  options.isMigrate = !process.env.DB_NAME;

  if (options.isMigrate) {
    if (options.isRunAllTests) {
      presets.db.database = randomUUID();
    } else {
      presets.db.database = await getBranchName();
    }
    process.env.DB_NAME = presets.db.database;
  }

  return Context.init(options);
};
