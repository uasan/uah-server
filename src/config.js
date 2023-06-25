import process from 'process';
import { pathToFileURL } from 'url';

export const CWD = process.cwd();

export const LIB_NAME = '@uah/server';

export const PATH_SRC = CWD + '/src/';
export const PATH_BUILD = CWD + '/build/';
export const PATH_SRC_APP = PATH_SRC + 'app/';

export const URL_BUILD = pathToFileURL(PATH_BUILD).href;

export const PATH_NODE_MODULES = CWD + '/node_modules/';
export const PATH_LIB = PATH_NODE_MODULES + LIB_NAME + '/';
export const PATH_LIB_SRC = PATH_LIB + 'src/';
export const PATH_LIB_TYPES = PATH_LIB_SRC + 'interfaces/';

export const URL_LIB_RUNTIME = LIB_NAME + '/src/runtime/';

export function initConfig({ pathsBasePath, plugins }) {
  //
}
