const API_BASE = 'http://localhost:3000/api';

export async function fetchImportLogs(page = 1, limit = 10) {
  const res = await fetch(`${API_BASE}/imports/history?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch import logs');
  return res.json();
}

export async function triggerImport() {
  const res = await fetch(`${API_BASE}/imports/trigger`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to trigger import');
  return res.json();
}
