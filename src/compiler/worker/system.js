import ts from 'typescript';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

export const { writeFile } = ts.sys;

export const readFileUrl = (path, options) =>
  readFileSync(fileURLToPath(path, options));

export const createSHA256Hash = text =>
  createHash('sha256').update(text, 'utf8').digest('base64url');

export const system = {
  ...ts.sys,
  createSHA256Hash,
  createHash: createSHA256Hash,
};
