import * as allRoles from './roles.js';

const roles = Object.values(allRoles);

export const isRole = role => roles.includes(role);
