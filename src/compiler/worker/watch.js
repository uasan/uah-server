import ts from 'typescript';
import { system } from './system.js';
import { compilerOptions } from './config.js';
import { createProgram } from './program.js';
import { host } from '../host.js';

const {
  createWatchProgram,
  sys: { newLine, getCurrentDirectory },
  formatDiagnosticsWithColorAndContext,
} = ts;

const useCaseSensitiveFileNames = () => true;

const formatHost = {
  getCurrentDirectory,
  getNewLine: () => newLine,
  getCanonicalFileName: path => path,
};

function reportDiagnostic(_, code, diagnostics) {
  if (code === 0) {
    console.error(
      formatDiagnosticsWithColorAndContext(diagnostics, formatHost)
    );
  }
}

function reportWatchStatus(diagnostic) {
  console.log(formatDiagnosticsWithColorAndContext([diagnostic], formatHost));
}

export const createWatchHost = (basePath, hooks) => {
  host.hooks = hooks;

  const compilerHost = ts.createWatchCompilerHost(
    basePath + '/tsconfig.json',
    compilerOptions,
    system,
    createProgram,
    reportDiagnostic,
    reportWatchStatus
  );

  compilerHost.useCaseSensitiveFileNames = useCaseSensitiveFileNames;

  createWatchProgram(compilerHost);
};
