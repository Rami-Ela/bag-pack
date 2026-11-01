export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  // Session expired or revoked: full reload drops the cached data of the previous user.
  if (res.status === 401) window.location.assign("/login");
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`);
  return res.json();
}
