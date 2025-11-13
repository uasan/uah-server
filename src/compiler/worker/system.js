import { readFileSync } from 'node:fs';
import { hash } from 'node:crypto';
import ts from 'typescript';
import { formatDiagnosticsWithColorAndContext } from 'typescript';
import { fileURLToPath } from 'node:url';

export const { writeFile, newLine, getCurrentDirectory } = ts.sys;

export const readFileUrl = (path, options) =>
  readFileSync(fileURLToPath(path, options));

export const createSHA256Hash = text => hash('sha256', text, 'base64url');

export const formatHost = {
  getCurrentDirectory,
  getNewLine: () => newLine,
  getCanonicalFileName: path => path,
};

export function reportDiagnostic(diagnostics) {
  console.error(formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
}

export function reportWatchStatus(diagnostic) {
  if (diagnostic.code !== 6031) {
    console.log(formatDiagnosticsWithColorAndContext([diagnostic], formatHost));
  }
}

export const isErrorDiagnostic = ({ category }) =>
  category === ts.DiagnosticCategory.Error;

export const system = {
  ...ts.sys,
  createSHA256Hash,
  createHash: createSHA256Hash,
  useCaseSensitiveFileNames: true,
  onUnRecoverableConfigFileDiagnostic(diag) {
    if (diag.code) {
      console.error(formatDiagnosticsWithColorAndContext([diag], formatHost));
    }
  },
};
