import { useState, useRef, useCallback } from 'react';

export function useAutocomplete({ debounceMs = 800 } = {}) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const requestSuggestion = useCallback((context, title) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();
    setSuggestion('');

    if (!context || context.trim().length < 10) return;

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/ai/autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ context, title }),
          signal: controller.signal,
        });

        if (!response.ok) {
          setSuggestion('');
          return;
        }

        const data = await response.json();
        if (data.suggestion) {
          setSuggestion(data.suggestion);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Autocomplete error:', err);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  const acceptSuggestion = useCallback(() => {
    const accepted = suggestion;
    setSuggestion('');
    return accepted;
  }, [suggestion]);

  const dismissSuggestion = useCallback(() => {
    setSuggestion('');
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();
    setSuggestion('');
  }, []);

  return {
    suggestion,
    loading,
    requestSuggestion,
    acceptSuggestion,
    dismissSuggestion,
    cleanup,
  };
}
