import { presets } from '../env.js';

export const routes = new Map();
export const { port = 3000, baseURI = '/api' } = presets.server;
