import { ERROR_FORMATTED, ERROR_REPORTED } from '#utils/native.js';
import { bold, red, green, blue, grey } from '#utils/console.js';
import { baseURI } from '#utils/location.js';
import { LIST, INDEX } from './tree.js';

const filterStack = line => line.includes(baseURI);
const mapStack = line => line.slice(line.indexOf('file://'), -1);

export const reportStartTests = () => {
  console.log(green(bold('\nTest start \n')));
};

export const reportEndTests = () => {
  console.log(green(bold('\nTest end')));
};

export const reportFail = (test, error) => {
  if (!error || error[ERROR_REPORTED]) {
    return;
  }

  console.error(red(bold('✕ FAIL: ')) + test.describe);
  console.log();
  console.group();

  if (error[ERROR_FORMATTED]) {
    delete error[ERROR_FORMATTED];
    console.error(error);
  } else {
    const message = error?.message || String(error);
    const stack = error?.stack || '';

    if (error?.status) {
      console.error(red('Status ' + error.status + ' ' + message));
    } else {
      console.error(message);
    }

    if (error?.errors) {
      if (Array.isArray(error.errors))
        error.errors.forEach(error => console.error(error));
      else console.error(error.errors);
    }

    error[ERROR_FORMATTED] = true;

    console.error(
      blue(stack.split('\n').filter(filterStack).map(mapStack).join('\n'))
    );
  }

  console.groupEnd();
  console.log();
  process.exitCode = 1;
  error[ERROR_REPORTED] = true;
};

export const reportAborted = ({ message }) => {
  console.log(red(bold(message)));
  process.exitCode = 1;
};

export const reportPass = (test, node) => {
  if (node.target === test) {
    console.log(green(bold('✓ PASS: ')) + test.describe);
  }
};

export const reportSkipped = (test, node) => {
  if (node.target === test) {
    console.log(grey(bold('- SKIP: ')) + test.describe);
  }
};

export const reportErrorEndTests = error => {
  if (error && !error[ERROR_REPORTED]) console.error(error);
};

export const printTestTree = (tree, indents = '') => {
  let index = 0;
  let size = tree.size;

  if (indents === '') {
    console.log('Total tests ' + bold(LIST.length));
  }

  for (const [test, node] of tree) {
    let isLast = ++index === size;
    let num = node.index.toString().padStart(INDEX.toString().length, ' ');

    console.log(
      (test.stack > 1 ? red(num) : num) +
        ' ' +
        grey(indents + (isLast ? '└──' : '├──')) +
        test.describe
    );
    printTestTree(node.children, indents + (isLast ? '   ' : '│  '));
  }
};
