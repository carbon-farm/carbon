const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:7000/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = payload?.message ?? `Request failed (${response.status})`;
    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status);
  }

  return payload as T;
}

// Separate from apiRequest because file uploads need FormData with no
// Content-Type header set at all — the browser fills in the multipart
// boundary itself. Setting 'application/json' (or any fixed value) here
// would break the upload silently.
export async function apiUpload<T>(path: string, file: File, token: string): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = payload?.message ?? `Request failed (${response.status})`;
    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status);
  }

  return payload as T;
}
