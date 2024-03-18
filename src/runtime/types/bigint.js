export function tryParseBigInt(value) {
  try {
    return value && BigInt(value);
  } catch {
    return value;
  }
}
