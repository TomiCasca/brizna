export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// El proxy RSS gratuito (rss2json, sin API key) corta si le llegan muchos
// pedidos en simultáneo. Como esto solo corre una vez por día, conviene
// hacerlo secuencial con una pausa chica antes que arriesgar un 429.
export async function sequentialMap(items, worker, { delayMs = 300 } = {}) {
  const results = [];
  for (const item of items) {
    results.push(await worker(item));
    if (delayMs > 0) await delay(delayMs);
  }
  return results;
}
