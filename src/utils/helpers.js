export const DEFAULT_CATEGORIES = [
  'Freelancer Work',
  'Personal',
  'Activities',
  'Study',
  'Fitness',
  'Office Work',
  'Goals',
];

export function mergeCategories(userFolders = [], hiddenCategories = []) {
  const hidden = new Set(hiddenCategories);
  const defaults = DEFAULT_CATEGORIES.filter((c) => !hidden.has(c));
  const set = new Set([...defaults, ...userFolders]);
  return [...set];
}

export function getNoteBentoSize(note) {
  if (note.isPinned && note.favorite) return 'featured';
  if (note.isPinned) return 'wide';
  if (note.body && note.body.length > 300) return 'tall';
  return 'standard';
}

export function generateId() {
  return crypto.randomUUID();
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function isHtmlContent(content) {
  if (!content) return false;
  return /<[a-z][\s\S]*>/i.test(content);
}

export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateString);
}
