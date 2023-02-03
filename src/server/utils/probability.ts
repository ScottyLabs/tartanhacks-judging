/**
 * Returns true or false with the specified probability (0.5 by default)
 */
export function flipCoin(probability = 0.5): boolean {
  return Math.random() <= probability;
}
