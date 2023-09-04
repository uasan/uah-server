import { connect, disconnect } from './database.js';

export async function migrate(context, migrations) {
  const ctx = await connect(context);

  await disconnect(ctx);
}
