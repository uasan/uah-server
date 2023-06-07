import { entities, host } from '../host.js';

export class Entity {
  url = '';
  assert = '';

  constructor(path) {
    this.path = path;
    entities.set(path, this);
    //console.log(this.constructor.name, path);
  }

  emitting(file) {
    return file;
  }

  emit(file) {
    return file;
  }

  emitted(file) {
    return file;
  }

  save(data) {
    host.hooks.saveFile(this.url, data);
  }

  delete() {
    entities.delete(this.path);

    if (this.url) {
      host.hooks.deleteFile(this.url);
    }

    return this;
  }

  static factory(path) {
    return entities.get(path) ?? new this(path);
  }

  static init({ path, location }) {
    if (location) {
      this.location = location;
    }

    this.path = new RegExp(
      '/' +
        path
          .replaceAll('.', '\\.')
          .replaceAll('**', '.+')
          .replaceAll('*', '[^/]+') +
        '$'
    );
  }
}
