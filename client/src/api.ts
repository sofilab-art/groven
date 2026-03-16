const BASE = '/api';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export const login = (username: string, password: string) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const register = (username: string, password: string, displayName: string) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password, display_name: displayName }) });

export const logout = () =>
  request('/auth/logout', { method: 'POST' });

export const getMe = () =>
  request('/auth/me');

// Spaces
export const getSpaces = () => request('/spaces');
export const getSpace = (id: string) => request(`/spaces/${id}`);
export const createSpace = (title: string, description: string) =>
  request('/spaces', { method: 'POST', body: JSON.stringify({ title, description }) });

// Rooms
export const getRooms = (spaceId: string) => request(`/spaces/${spaceId}/rooms`);
export const createRoom = (spaceId: string, title: string, description: string) =>
  request(`/spaces/${spaceId}/rooms`, { method: 'POST', body: JSON.stringify({ title, description }) });

// Cards
export const getCards = (roomId: string) => request(`/rooms/${roomId}/cards`);
export const getCard = (id: string) => request(`/cards/${id}`);
export const createCard = (roomId: string, data: any) =>
  request(`/rooms/${roomId}/cards`, { method: 'POST', body: JSON.stringify(data) });
export const getGraph = (roomId: string) => request(`/rooms/${roomId}/graph`);

// Links
export const createLink = (cardId: string, targetId: string, relationType: string) =>
  request(`/cards/${cardId}/links`, { method: 'POST', body: JSON.stringify({ target_card_id: targetId, relation_type: relationType }) });

// Votes
export const vote = (cardId: string, position: string, justification: string) =>
  request(`/cards/${cardId}/vote`, { method: 'POST', body: JSON.stringify({ position, justification }) });
export const getVotes = (cardId: string) => request(`/cards/${cardId}/votes`);

// SSE helpers
export function streamPreview(
  roomId: string,
  body: string,
  parentId: string | null,
  onEvent: (event: string, data: any) => void
): AbortController {
  const controller = new AbortController();
  fetch(`${BASE}/cards/preview`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, body, parent_id: parentId }),
    signal: controller.signal,
  }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      let eventName = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventName = line.slice(7);
        } else if (line.startsWith('data: ') && eventName) {
          try {
            const data = JSON.parse(line.slice(6));
            onEvent(eventName, data);
          } catch {}
          eventName = '';
        }
      }
    }
  }).catch(() => {});
  return controller;
}

export function streamSynthesis(
  spaceId: string,
  onEvent: (event: string, data: any) => void
): AbortController {
  const controller = new AbortController();
  fetch(`${BASE}/spaces/${spaceId}/suggest-synthesis`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
  }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      let eventName = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventName = line.slice(7);
        } else if (line.startsWith('data: ') && eventName) {
          try {
            const data = JSON.parse(line.slice(6));
            onEvent(eventName, data);
          } catch {}
          eventName = '';
        }
      }
    }
  }).catch(() => {});
  return controller;
}

export function reclassifyPreview(data: {
  parent_card_id?: string;
  body: string;
  chosen_type: string;
  original_type: string;
  original_explanation?: string;
}) {
  return request('/cards/reclassify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
