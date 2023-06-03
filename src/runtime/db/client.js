import postgres from 'postgres';
import { presets } from '#env';
import { noop } from '#utils/native.js';
import { onAborted } from '#utils/process.js';

export const getConnectOptions = (
  options = presets.db,
  ns = presets.app.id.toUpperCase()
) => {
  options = {
    onnotice: noop,
    connect_timeout: 60,
    ...options,
    connection: {
      application_name: presets.app.id,
      ...options?.connection,
    },
  };

  const { env } = process;

  if (env[ns + '_DB_USER']) options.username = env[ns + '_DB_USER'];
  if (env[ns + '_DB_PASS']) options.password = env[ns + '_DB_PASS'];

  if (env.DB_PORT) options.port = env.DB_PORT;
  if (env.DB_HOST) options.host = env.DB_HOST;
  if (env.DB_NAME) options.database = env.DB_NAME;

  return options;
};

export const createClient = (options = getConnectOptions()) => {
  const client = postgres(options);

  onAborted(() => client.end({ timeout: 0 }));

  return client;
};
