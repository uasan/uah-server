import { presets } from '#env';
import { Test } from './internals/class.js';
import { factoryRequest } from './internals/request.js';

export { objectContaining as expected } from '#utils/assert.js';

export { file } from './internals/payload.js';

export const test = (describe, options, assert) =>
  new Test(describe, options, assert);

export const use = methods => ({
  get get() {
    return (methods.get.request ??= factoryRequest(methods, 'get'));
  },
  get post() {
    return (methods.post.request ??= factoryRequest(methods, 'post'));
  },
  get put() {
    return (methods.put.request ??= factoryRequest(methods, 'put'));
  },
  get patch() {
    return (methods.patch.request ??= factoryRequest(methods, 'patch'));
  },
  get delete() {
    return (methods.delete.request ??= factoryRequest(methods, 'delete'));
  },
});

export const log = value => {
  if (presets.app.isDevelopment)
    console.dir(value, {
      showHidden: false,
      depth: null,
      colors: true,
    });
};
