const API_BASE = "http://127.0.0.1:8000/api";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    throw new Error("API error");
  }
  return res.json();
}
