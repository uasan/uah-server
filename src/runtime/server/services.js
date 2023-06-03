import { factory } from '#db/sql/query.js';
import { securityService } from '#security/service.js';
import { intlService } from '#utils/intl.js';

const factoryContext = (context, service) => {
  const ctx = Object.create(context);

  ctx.sql = factory(ctx);
  ctx.service = service;
  ctx.state = Object.create(null);

  return ctx;
};

export const loadServices = async (context, services = []) => {
  await securityService(factoryContext(context), securityService);
  await intlService(factoryContext(context), intlService);

  for (const service of services) {
    service(factoryContext(context, service))?.catch(console.error);
  }
};
