import { styleText } from 'node:util';

const options = {
  validateStream: false
};

export const style = {
  bold(text) {
    return styleText('bold', text, options);
  },
  italic(text) {
    return styleText('italic', text, options);
  },
  underline(text) {
    return styleText('underline', text, options);
  },

  cyan(text) {
    return styleText('cyan', text, options);
  },
  magenta(text) {
    return styleText('magenta', text, options);
  },
  white(text) {
    return styleText('white', text, options);
  },
  gray(text) {
    return styleText('gray', text, options);
  },
  yellow(text) {
    return styleText('yellow', text, options);
  },
  red(text) {
    return styleText('red', text, options);
  },
  blue(text) {
    return styleText('blue', text, options);
  },
  green(text) {
    return styleText('green', text, options);
  },
  black(text) {
    return styleText('black', text, options);
  },

  yellowBright(text) {
    return styleText('yellowBright', text, options);
  },
  magentaBright(text) {
    return styleText('magentaBright', text, options);
  },
  cyanBright(text) {
    return styleText('cyanBright', text, options);
  },
  whiteBright(text) {
    return styleText('whiteBright', text, options);
  },
  redBright(text) {
    return styleText('redBright', text, options);
  },
  blueBright(text) {
    return styleText('blueBright', text, options);
  },
  greenBright(text) {
    return styleText('greenBright', text, options);
  },

  bgBlack(text) {
    return styleText('bgBlack', text, options);
  },
  bgYellow(text) {
    return styleText('bgYellow', text, options);
  },
  bgBlue(text) {
    return styleText('bgBlue', text, options);
  },
  bgMagenta(text) {
    return styleText('bgMagenta', text, options);
  },
  bgCyan(text) {
    return styleText('bgCyan', text, options);
  },
  bgWhite(text) {
    return styleText('bgWhite', text, options);
  },
  bgGray(text) {
    return styleText('bgGray', text, options);
  },
  bgRedBright(text) {
    return styleText('bgRedBright', text, options);
  },
  bgRed(text) {
    return styleText('bgRed', text, options);
  },
  bgGreen(text) {
    return styleText('bgGreen', text, options);
  },
  bgGreenBright(text) {
    return styleText('bgGreenBright', text, options);
  },
  bgYellowBright(text) {
    return styleText('bgYellowBright', text, options);
  },
  bgBlueBright(text) {
    return styleText('bgBlueBright', text, options);
  },
  bgMagentaBright(text) {
    return styleText('bgMagentaBright', text, options);
  },
  bgCyanBright(text) {
    return styleText('bgCyanBright', text, options);
  },
  bgWhiteBright(text) {
    return styleText('bgWhiteBright', text, options);
  },
};
