// Fetch wrapper handling JSON serialization and server error formatting.

export async function request(url, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    let payload = null;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      payload = await response.json();
    }

    if (!response.ok) {
      // The API contract guarantees friendly messages in payload.error
      const message = payload && payload.error ? payload.error : `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return payload;
  } catch (err) {
    // Re-throw our structured error or normalize offline network failures
    if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
      throw new Error('Unable to connect to clinic server. Please check your connection.');
    }
    throw err;
  }
}

export function fetchQueue() {
  return request('/api/queue');
}

export function registerPatient(patient) {
  return request('/api/patients', {
    method: 'POST',
    body: JSON.stringify(patient)
  });
}

export function callNextPatient() {
  return request('/api/next', {
    method: 'POST'
  });
}

export function cancelPatient(id) {
  return request(`/api/patients/${encodeURIComponent(id)}/cancel`, {
    method: 'POST'
  });
}

export function seedDemoData() {
  return request('/api/demo/seed', {
    method: 'POST'
  });
}

export function resetDemoData() {
  return request('/api/demo/reset', {
    method: 'POST'
  });
}
