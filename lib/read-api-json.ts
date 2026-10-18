// Reads a fetch() response from one of our JSON API routes. When the response
// isn't JSON at all (a proxy or the host rejecting the request before it reaches
// the route, e.g. 413 "Request Entity Too Large" for big uploads), res.json()
// would throw the cryptic `Unexpected token 'R', "Request En"... is not valid JSON`.
// This turns that into a message a person can act on.

export async function readApiJson<T extends { ok: boolean; error?: string }>(res: Response): Promise<T> {
  const raw = await res.text();
  try {
    return JSON.parse(raw) as T;
  } catch {
    if (res.status === 413) {
      throw new Error("The file is too large for the server to accept. Try a smaller file (under about 4MB).");
    }
    if (res.status >= 500) throw new Error(`The server had a problem (error ${res.status}). Please try again.`);
    throw new Error(`Unexpected response from the server (error ${res.status}). Please try again.`);
  }
}
