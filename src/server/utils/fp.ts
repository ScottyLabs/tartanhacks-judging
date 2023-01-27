function id<T>(x: T): T {
  return x;
}

function uproduct<T, U, W>(f: (x: T) => U, g: (x: T) => W): (x: T) => [U, W] {
  return (x: T) => [f(x), g(x)];
}

function product<T, U, V, W>(
  f: (x: T) => U,
  g: (y: V) => W
): (x: T, y: V) => [U, W] {
  return (x: T, y: V) => [f(x), g(y)];
}

function mapReducePartial<T, U, V>(
  f: (x: T) => U,
  g: (y: V, z: U) => V,
  b: V
): (xs: T[]) => V {
  return (xs) => xs.map(f).reduce(g, b);
}

function mapReduce<T, U, V>(
  f: (x: T) => U,
  g: (y: V, z: U) => V,
  b: V,
  xs: T[]
): V {
  return mapReducePartial(f, g, b)(xs);
}

export { id, uproduct, product, mapReducePartial, mapReduce };
