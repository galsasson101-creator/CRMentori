const BASE_URL = '/api';

async function request(method, path, data) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data !== undefined) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const error = new Error(
      errorBody?.error || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function get(path) {
  return request('GET', path);
}

export function post(path, data) {
  return request('POST', path, data);
}

export function put(path, data) {
  return request('PUT', path, data);
}

export function patch(path, data) {
  return request('PATCH', path, data);
}

export function del(path) {
  return request('DELETE', path);
}
