import { presets } from '#env';
import { log } from '../utils/process.js';

const CODE = 500;

export class Exception extends Error {
  static status = CODE;
  static message = 'Internal Server Error';

  constructor(message = new.target.message) {
    super(message);
    this.status = new.target.status;
  }

  putErrors(errors) {
    this.errors = errors;
    return this;
  }

  static from({ message }) {
    return new this(message);
  }

  static of(error) {
    if (!error) {
      error = new Error(this.message);
    }

    const { message = error, errors = [{ message }] } = error;
    const status = error?.status >= 400 ? error.status : this.status;

    if (status >= CODE && !presets.app.isTesting) {
      log.error(error);
    }

    return { status, errors };
  }

  static respond(context, exception, id) {
    context.body = null;
    context.stream = null;

    if (exception == null) {
      context.status = 204;
    } else {
      const error = this.of(exception);
      if (id) error.id = id;

      context.error = exception;
      context.status = error.status;

      context.type = 'json';
      context.body = JSON.stringify(error);
      context.set('cache-control', 'no-store');
    }

    return context;
  }
}
