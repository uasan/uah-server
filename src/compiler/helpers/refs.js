import { afterEmit, host } from '../host.js';
import { toBuildPath, toRelativeURL } from './link.js';
import { writeFile } from '../worker/system.js';
import { stringify } from '../../runtime/types/json.js';
import { getValueOfLiteralType } from './values.js';

const refs = new Map();
const file = 'refs.js';

function makeSource() {
  let text = 'export const\n';

  for (const [source, name] of refs) {
    text += name + '=' + source + ',\n';
  }

  writeFile(toBuildPath(file), text.slice(0, -2) + ';');
}

export function getRefValue(source) {
  let name;
  const relUrl = toRelativeURL(host.entity.url, file);

  if (refs.has(source)) {
    name = refs.get(source);
  } else {
    name = '$' + refs.size;

    refs.set(source, name);
    afterEmit.add(makeSource);
  }

  return host.module.getImportName(relUrl, name);
}

export const getRefForLiteralTypes = ({ types }) =>
  getRefValue(stringify(types.map(getValueOfLiteralType)));
