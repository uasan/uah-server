import { PATH_SRC } from '#config';
import { entities, host } from '../host.js';

export class Entity {
  unlinks = null;

  constructor(path) {
    this.path = path;
    entities.set(path, this);
    // console.log(this.constructor.name, path);
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
    this.unlinks?.purge();
    entities.delete(this.path);
    host.hooks.deleteFile(this.url);
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
      path.replaceAll('.', '\\.').replaceAll('**', '.+').replaceAll('*', '.+') +
        '$',
    );
  }
}

export class JsonEntity extends Entity {
  url = this.path.slice(PATH_SRC.length);

  emitted(file) {
    this.save(file.text);
  }
}
