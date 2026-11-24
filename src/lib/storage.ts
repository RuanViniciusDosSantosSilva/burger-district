/** Acesso seguro ao localStorage (pode estar indisponível em iframes ou modo privado). */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* armazenamento indisponível: o carrinho segue apenas em memória */
  }
}
