import { red, green, inverse } from '#utils/console.js';

export const wrongSchema = (schemas, name) => {
  const names = schemas.map(({ name }) => green(name)).join('", "');

  throw red(
    name
      ? `Not found schema ${inverse(name)}\nPlease use "${names}"`
      : `Please enter one of "${names}"`
  );
};

export const wrongAllSchemas = () => {
  throw red(`Please enter "${green('schemas')}"`);
};
