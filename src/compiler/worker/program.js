import ts from 'typescript';
import { emit } from './emit.js';
import { host } from '../host.js';

const { createSemanticDiagnosticsBuilderProgram } = ts;

export function createProgram(
  rootFileNames,
  compilerOptions,
  hostBuilder,
  builderProgram,
  configFileParsingDiagnostics,
  projectReferences,
) {
  host.builder = hostBuilder;
  host.options = compilerOptions;

  if (host.bootstrap) {
    host.open(compilerOptions);
  } else if (hostBuilder.hasInvalidatedResolutions()) {
    host.reset(compilerOptions);
  } else {
    host.emitting();
  }

  const program = createSemanticDiagnosticsBuilderProgram(
    rootFileNames,
    compilerOptions,
    hostBuilder,
    builderProgram,
    configFileParsingDiagnostics,
    projectReferences,
  );

  program.emit = emit;

  return program;
}
