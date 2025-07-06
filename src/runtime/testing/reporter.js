import { style } from '#utils/console.js';

export class Reporter {
  count = 0;
  stack = { length: 0, up: null, indent: '' };

  start({ length }) {
    this.stack = {
      length,
      up: this.stack,
      indent: this.stack.indent + (this.stack.length ? style.gray('│  ') : this.stack.up ? '   ' : ''),
    };
  }

  end() {
    this.stack = this.stack.up;
  }

  print({ meta, description }, text) {
    this.count++;
    this.stack.length--;
    text = this.stack.indent + style.gray(this.stack.length ? '├──' : '└──') + style.bold(text);

    if (description) {
      text += ' ' + description;
    }

    // ' ' + meta.url

    console.log(text);
  }

  pass(test) {
    this.print(test, style.green('✓ ') + test.meta.name);
  }

  fail(test) {
    this.print(test, style.red('✕ ' + test.meta.name));
    console.log();
  }

  skip(test) {
    this.print(test, style.gray('SKIP ' + test.meta.name));
  }

  static showTree(tests, indents = '', calls = 0) {
    for (let i = 0; i < tests.length; i) {
      const test = tests[i];
      const isLast = ++i === tests.length;

      calls++;

      console.log(
        (indents + style.gray(isLast ? '└── ' : '├── '))
          + test.constructor.name + ' '
          + style.gray(test.meta.level + ' ' + test.meta.id),
      );

      if (test.children.length) {
        calls = showTree(test.children, indents + (isLast ? '   ' : style.gray('│  ')), calls);
      }
    }

    return calls;
  }
}
