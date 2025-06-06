import ts from 'typescript';
import { initConfig } from '../config.js';

const { visitEachChild, nullTransformationContext } = ts;

export const entities = new Map();
export const types = new WeakMap();
export const decorators = new WeakMap();
export const declarations = new WeakMap();
export const transformers = new WeakMap();
export const metaSymbols = new WeakMap();
export const internalSymbols = new WeakSet();

export const beforeEmit = new Set();
export const afterEmit = new Set();
export const emitEntities = new Set();

export class Unlinks extends Map {
  hook = null;

  constructor(hook) {
    super();

    if (hook) {
      this.hook = hook;
      afterEmit.add(hook);
    }
  }

  purge() {
    if (this.size) {
      for (const [key, map] of this) {
        map.delete(key);
      }
      this.clear();
    }

    if (this.hook) {
      afterEmit.add(this.hook);
    }
  }
}

export const host = {
  hooks: null,

  bootstrap: true,
  factory: ts.factory,

  file: null,
  module: null,
  entity: null,
  builder: null,
  options: null,
  program: null,
  checker: null,

  open(options) {
    initConfig(options);
    this.hooks.open();
  },

  visit(node) {
    return node;
  },

  visitEachChild(node) {
    return visitEachChild(node, this.visit, nullTransformationContext);
  },

  emitting() {
    this.hooks.beforeEmit();
  },

  emitted() {
    this.file = null;
    this.entity = null;
    this.module = null;
    this.builder = null;
    this.program = null;
    this.checker = null;

    emitEntities.clear();
    this.hooks.afterEmit();

    this.bootstrap = false;
  },

  reset(options) {
    entities.clear();
    this.hooks.reset();

    this.bootstrap = true;
  },
};
