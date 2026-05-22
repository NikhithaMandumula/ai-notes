const API_BASE = '/api';
const NOTES_BASE = `${API_BASE}/notes`;
const AUTH_BASE = `${API_BASE}/auth`;

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// Auth API

export async function signup(name, email, password) {
  const response = await fetch(`${AUTH_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }
  return data;
}

export async function login(email, password) {
  const response = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
}

export async function forgotPassword(email) {
  const response = await fetch(`${AUTH_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export async function resetPassword(email, code, newPassword) {
  const response = await fetch(`${AUTH_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Reset failed');
  }
  return data;
}


// Notes API

export async function fetchNotes({ search = '', folder, tag, sort, includeDeleted } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (folder !== undefined && folder !== null) params.set('folder', folder);
  if (tag) params.set('tag', tag);
  if (sort) params.set('sort', sort);
  if (includeDeleted) params.set('includeDeleted', 'true');

  const queryString = params.toString();
  const url = queryString ? `${NOTES_BASE}?${queryString}` : NOTES_BASE;

  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}

export async function createNote({ title, body, folder, tags }) {
  const response = await fetch(NOTES_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, body, folder, tags }),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
}

export async function updateNote(id, { title, body, folder, tags }) {
  const response = await fetch(`${NOTES_BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ title, body, folder, tags }),
  });
  if (!response.ok) throw new Error('Failed to update note');
  return response.json();
}

export async function toggleFavorite(id) {
  const response = await fetch(`${NOTES_BASE}/${id}/favorite`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to toggle favorite');
  return response.json();
}

export async function togglePin(id) {
  const response = await fetch(`${NOTES_BASE}/${id}/pin`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to toggle pin');
  return response.json();
}

export async function deleteNote(id) {
  const response = await fetch(`${NOTES_BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete note');
  return response.json();
}

export async function restoreNote(id) {
  const response = await fetch(`${NOTES_BASE}/${id}/restore`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to restore note');
  return response.json();
}

export async function permanentDeleteNote(id) {
  const response = await fetch(`${NOTES_BASE}/${id}/permanent`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to permanently delete note');
  return response.json();
}

export async function fetchFolders() {
  const response = await fetch(`${NOTES_BASE}/folders`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch folders');
  return response.json();
}

export async function deleteFolder(name) {
  const response = await fetch(`${NOTES_BASE}/folders/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete folder');
  return response.json();
}

export async function fetchTags() {
  const response = await fetch(`${NOTES_BASE}/tags`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

// Shares API

const SHARES_BASE = `${API_BASE}/shares`;

export async function shareNote(noteId, toEmail) {
  const response = await fetch(SHARES_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ noteId, toEmail }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to share note');
  return data;
}

export async function fetchSentShares() {
  const response = await fetch(`${SHARES_BASE}/sent`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch sent shares');
  return response.json();
}

export async function fetchReceivedShares() {
  const response = await fetch(`${SHARES_BASE}/received`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch received shares');
  return response.json();
}

export async function fetchPendingShareCount() {
  const response = await fetch(`${SHARES_BASE}/received/count`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch share count');
  return response.json();
}

export async function acceptShare(shareId) {
  const response = await fetch(`${SHARES_BASE}/${shareId}/accept`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to accept share');
  return response.json();
}

export async function dismissShare(shareId) {
  const response = await fetch(`${SHARES_BASE}/${shareId}/dismiss`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to dismiss share');
  return response.json();
}

// AI API

export async function fetchAnalytics(period = '') {
  const params = period ? `?period=${period}` : '';
  const response = await fetch(`${NOTES_BASE}/analytics${params}`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

export async function generateSummary(content) {
  const response = await fetch(`${API_BASE}/ai/summary`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to generate summary');
  return data;
}

// Chat API

const CHAT_BASE = `${API_BASE}/chat`;

export async function sendChatMessage(conversationId, message) {
  const response = await fetch(CHAT_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ conversationId, message }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to send message');
  }
  return response;
}

export async function getConversations() {
  const response = await fetch(`${CHAT_BASE}/conversations`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch conversations');
  return response.json();
}

export async function getConversation(id) {
  const response = await fetch(`${CHAT_BASE}/conversations/${id}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch conversation');
  return response.json();
}

export async function deleteConversation(id) {
  const response = await fetch(`${CHAT_BASE}/conversations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete conversation');
  return response.json();
}

// Resources API

export async function uploadFileForNotes(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/resources/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to generate notes from file');
  return data.notes;
}

export async function uploadImage(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_BASE}/resources/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to upload image');
  return data.url;
}

export async function generateNotesFromYouTube(url) {
  const response = await fetch(`${API_BASE}/resources/youtube`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ url }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to generate notes from YouTube');
  return data.notes;
}

// Profile API

const PROFILE_BASE = `${API_BASE}/profile`;

export async function fetchProfile() {
  const response = await fetch(PROFILE_BASE, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

export async function updateProfile({ name, bio }) {
  const response = await fetch(PROFILE_BASE, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ name, bio }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
}

export async function uploadProfilePicture(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('profilePicture', file);
  const response = await fetch(`${PROFILE_BASE}/picture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to upload profile picture');
  return data.profilePicture;
}

export async function removeProfilePicture() {
  const response = await fetch(`${PROFILE_BASE}/picture`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to remove profile picture');
  return response.json();
}
