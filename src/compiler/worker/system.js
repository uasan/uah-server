import { readFileSync } from 'fs';
import { hash } from 'node:crypto';
import ts from 'typescript';
import { fileURLToPath } from 'url';

export const { writeFile } = ts.sys;

export const readFileUrl = (path, options) => readFileSync(fileURLToPath(path, options));
export const createSHA256Hash = text => hash('sha256', text, 'base64url');

export const system = {
  ...ts.sys,
  createSHA256Hash,
  createHash: createSHA256Hash,
};
