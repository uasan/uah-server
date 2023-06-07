import ts from 'typescript';
import { host } from '../host.js';
import { compilerOptions } from './config.js';

const { SourceFileStatements } = ts.ListFormat;

const writer = ts.createTextWriter('\n');
const printer = ts.createPrinter(compilerOptions);

export const printNodes = nodes => {
  printer.writeList(SourceFileStatements, nodes, host.file, writer);
  try {
    return writer.getText();
  } finally {
    writer.clear();
  }
};

export const printNode = node => printNodes([node]);

console.info = (node, ...args) => {
  console.log(printNodes(Array.isArray(node) ? node : [node]), ...args);
};
