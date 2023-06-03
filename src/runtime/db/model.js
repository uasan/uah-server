import { allowPrivate } from '#security/access.js';
import { Patches } from './patches.js';

export class Model {
  static parent = null;
  static validator = null;
  static relations = null;

  static applyPatches(context, patches, payload) {
    return context.transaction(
      (context, payload) =>
        new Patches(this, patches).execute(context, payload),
      payload
    );
  }

  static createPatchAPI({ params, rewrite, access = allowPrivate } = {}) {
    const action = rewrite
      ? (context, { patches, ...payload }) =>
          this.applyPatches(
            context,
            patches.map(({ path, ...patch }) => ({
              ...patch,
              path: rewrite(context, path, payload),
            })),
            payload
          )
      : (context, { patches, ...payload }) =>
          this.applyPatches(context, patches, payload);

    return {
      params: {
        ...params,
        body: {
          ...params?.body,
          patches: { type: 'array', empty: false, items: 'object' },
        },
      },
      access,
      action,
    };
  }

  static getSettingNameRejectDelete() {
    return `smartapps.${this.tableName}.reject_deleted`;
  }
}
