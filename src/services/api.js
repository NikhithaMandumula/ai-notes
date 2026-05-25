const API_BASE = '/api';
const NOTES_BASE = `${API_BASE}/notes`;
const AUTH_BASE = `${API_BASE}/auth`;

function jsonHeaders() {
  return { 'Content-Type': 'application/json' };
}

// Auth API

export async function signup(name, email, password) {
  const response = await fetch(`${AUTH_BASE}/signup`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
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
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Login failed');
  }
  return response.json();
}

export async function forgotPassword(email) {
  const response = await fetch(`${AUTH_BASE}/forgot-password`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const text = await response.text();
    try { throw new Error(JSON.parse(text).message); }
    catch { throw new Error('Request failed'); }
  }
  return response.json();
}

export async function resetPassword(email, code, newPassword) {
  const response = await fetch(`${AUTH_BASE}/reset-password`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ email, code, newPassword }),
  });
  if (!response.ok) {
    const text = await response.text();
    try { throw new Error(JSON.parse(text).message); }
    catch { throw new Error('Reset failed'); }
  }
  return response.json();
}

export async function verifySession() {
  const response = await fetch(`${AUTH_BASE}/me`, {
    credentials: 'include',
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.user;
}

export async function logoutApi() {
  const response = await fetch(`${AUTH_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Logout failed');
  return response.json();
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

  const response = await fetch(url, { headers: jsonHeaders(), credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}

export async function createNote({ title, body, folder, tags }) {
  const response = await fetch(NOTES_BASE, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ title, body, folder, tags }),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
}

export async function updateNote(id, { title, body, folder, tags }) {
  const response = await fetch(`${NOTES_BASE}/${id}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ title, body, folder, tags }),
  });
  if (!response.ok) throw new Error('Failed to update note');
  return response.json();
}

export async function toggleFavorite(id) {
  const response = await fetch(`${NOTES_BASE}/${id}/favorite`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to toggle favorite');
  return response.json();
}

export async function togglePin(id) {
  const response = await fetch(`${NOTES_BASE}/${id}/pin`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to toggle pin');
  return response.json();
}

export async function deleteNote(id) {
  const response = await fetch(`${NOTES_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete note');
  return response.json();
}

export async function restoreNote(id) {
  const response = await fetch(`${NOTES_BASE}/${id}/restore`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to restore note');
  return response.json();
}

export async function permanentDeleteNote(id) {
  const response = await fetch(`${NOTES_BASE}/${id}/permanent`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to permanently delete note');
  return response.json();
}

export async function fetchFolders() {
  const response = await fetch(`${NOTES_BASE}/folders`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch folders');
  return response.json();
}

export async function deleteFolder(name) {
  const response = await fetch(`${NOTES_BASE}/folders/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete folder');
  return response.json();
}

export async function fetchTags() {
  const response = await fetch(`${NOTES_BASE}/tags`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

// Shares API

const SHARES_BASE = `${API_BASE}/shares`;

export async function shareNote(noteId, toEmail) {
  const response = await fetch(SHARES_BASE, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ noteId, toEmail }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to share note');
  return data;
}

export async function fetchSentShares() {
  const response = await fetch(`${SHARES_BASE}/sent`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch sent shares');
  return response.json();
}

export async function fetchReceivedShares() {
  const response = await fetch(`${SHARES_BASE}/received`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch received shares');
  return response.json();
}

export async function fetchPendingShareCount() {
  const response = await fetch(`${SHARES_BASE}/received/count`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch share count');
  return response.json();
}

export async function acceptShare(shareId) {
  const response = await fetch(`${SHARES_BASE}/${shareId}/accept`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to accept share');
  return response.json();
}

export async function dismissShare(shareId) {
  const response = await fetch(`${SHARES_BASE}/${shareId}/dismiss`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to dismiss share');
  return response.json();
}

// AI API

export async function fetchAnalytics(period = '') {
  const params = period ? `?period=${period}` : '';
  const response = await fetch(`${NOTES_BASE}/analytics${params}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

export async function generateSummary(content) {
  const response = await fetch(`${API_BASE}/ai/summary`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
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
    headers: jsonHeaders(),
    credentials: 'include',
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
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch conversations');
  return response.json();
}

export async function getConversation(id) {
  const response = await fetch(`${CHAT_BASE}/conversations/${id}`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch conversation');
  return response.json();
}

export async function deleteConversation(id) {
  const response = await fetch(`${CHAT_BASE}/conversations/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete conversation');
  return response.json();
}

// Resources API

export async function uploadFileForNotes(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/resources/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to generate notes from file');
  return data.notes;
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_BASE}/resources/upload-image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to upload image');
  return data.url;
}

export async function generateNotesFromYouTube(url) {
  const response = await fetch(`${API_BASE}/resources/youtube`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ url }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to generate notes from YouTube');
  return data.notes;
}

// Profile API

const PROFILE_BASE = `${API_BASE}/profile`;

export async function fetchProfile() {
  const response = await fetch(PROFILE_BASE, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

export async function updateProfile({ name, bio }) {
  const response = await fetch(PROFILE_BASE, {
    method: 'PUT',
    headers: jsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ name, bio }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
}

export async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const response = await fetch(`${PROFILE_BASE}/picture`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to upload profile picture');
  return data.profilePicture;
}

export async function removeProfilePicture() {
  const response = await fetch(`${PROFILE_BASE}/picture`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to remove profile picture');
  return response.json();
}
