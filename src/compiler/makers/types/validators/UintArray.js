export class UintArray {
  static make(context) {
    context.isBinary = true;
  }

  static makeDecoder(node) {
    return node;
  }
}
