import ts from 'typescript';
import { emit } from './emit.js';
import { host } from '../host.js';
import { compilerOptions } from './config.js';
import { BuilderHooks } from './hooks.js';
import { CWD } from '../../config.js';
import {
  isErrorDiagnostic,
  reportDiagnostic,
  reportWatchStatus,
  system,
} from './system.js';

const { createSemanticDiagnosticsBuilderProgram } = ts;

function createWatchProgram(
  rootFileNames,
  compilerOptions,
  hostBuilder,
  builderProgram,
  configFileParsingDiagnostics,
  projectReferences,
) {
  host.isWatch = true;
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

function createBuildProgram(parsed, hostBuilder) {
  host.builder = hostBuilder;
  host.options = parsed.options;
  host.open(parsed.options);

  const program = createSemanticDiagnosticsBuilderProgram(
    parsed.fileNames,
    parsed.options,
    hostBuilder,
    undefined,
    parsed.errors,
    parsed.projectReferences,
  );

  const diagnostics = ts.getPreEmitDiagnostics(program.getProgram());

  if (diagnostics.length) {
    reportDiagnostic(diagnostics);

    if (diagnostics.some(isErrorDiagnostic)) {
      return 1;
    }
  }

  emit.call(program);

  return 0;
}

export function runWatchHost(workerFile) {
  host.hooks = new BuilderHooks(workerFile);

  const compilerHost = ts.createWatchCompilerHost(
    CWD + '/tsconfig.json',
    compilerOptions,
    system,
    createWatchProgram,
    (_, _code, diagnostics) => {
      reportDiagnostic(diagnostics);
    },
    reportWatchStatus,
  );

  ts.createWatchProgram(compilerHost);
}

export function runBuilderHost(workerFile) {
  host.hooks = new BuilderHooks(workerFile);

  const parsed = ts.getParsedCommandLineOfConfigFile(
    CWD + '/tsconfig.json',
    compilerOptions,
    system,
  );

  if (parsed) {
    process.exitCode = createBuildProgram(
      parsed,
      ts.createIncrementalCompilerHost(parsed.options, system),
    );
  } else {
    process.exitCode = 1;
  }
}
