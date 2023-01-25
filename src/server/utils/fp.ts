function id<T>(x : T) : T {
  return x;
}

function uproduct<T, U, W>(f : (x : T) => U, g : (x : T) => W) : (x : T) => [U, W] {
  return (x : T) => [f(x), g(x)]
}

function product<T, U, V, W>(f : (x : T) => U, g : (y : V) => W) : (x : T, y : V) => [U, W] {
  return (x : T, y : V) => [f(x), g(y)];
}

export { id, uproduct, product }