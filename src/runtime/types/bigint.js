export function tryParseBigInt(value) {
  try {
    return value && BigInt(value);
  } catch {
    return value;
  }
}

BigInt.prototype.toJSON = function toJSON() {
  return this.toString();
};
