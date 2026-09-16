// Coefficienti binomiali e distribuzione ipergeometrica calcolati in log-spazio
// per evitare overflow con deck fino a ~60 carte e pescate fino a ~20.

const logFactorialCache: number[] = [0];

function logFactorial(n: number): number {
  if (n < 0) return -Infinity;
  while (logFactorialCache.length <= n) {
    const i = logFactorialCache.length;
    logFactorialCache.push(logFactorialCache[i - 1] + Math.log(i));
  }
  return logFactorialCache[n];
}

export function logChoose(n: number, k: number): number {
  if (k < 0 || k > n || n < 0) return -Infinity;
  return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
}

export function choose(n: number, k: number): number {
  const lc = logChoose(n, k);
  return lc === -Infinity ? 0 : Math.exp(lc);
}

/** P(X = k) per X ~ Hypergeometric(N, K, n): N carte nel mazzo, K copie della carta/gruppo, n pescate. */
export function hyperPmf(N: number, K: number, n: number, k: number): number {
  const lc = logChoose(K, k) + logChoose(N - K, n - k) - logChoose(N, n);
  return lc === -Infinity ? 0 : Math.exp(lc);
}

/** P(X >= min) per X ~ Hypergeometric(N, K, n). */
export function hyperAtLeast(N: number, K: number, n: number, min: number): number {
  let sum = 0;
  const kMax = Math.min(K, n);
  for (let k = Math.max(0, min); k <= kMax; k++) {
    sum += hyperPmf(N, K, n, k);
  }
  return clampProbability(sum);
}

export function clampProbability(p: number): number {
  if (Number.isNaN(p)) return 0;
  return Math.min(1, Math.max(0, p));
}
