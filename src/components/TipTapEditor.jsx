import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style';
import { useEffect, useRef } from 'react';
import { GhostText, ghostTextPluginKey } from '../extensions/ghostText';
import { useAutocomplete } from '../hooks/useAutocomplete';
import EditorToolbar from './EditorToolbar';

function TipTapEditor({ content, onUpdate, title, placeholder, className, showToolbar = true }) {
  const { suggestion, requestSuggestion, acceptSuggestion, dismissSuggestion, cleanup } =
    useAutocomplete({ debounceMs: 800 });

  const suggestionRef = useRef(suggestion);
  suggestionRef.current = suggestion;

  const isExternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
      GhostText,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Color,
      TextStyle,
      FontSize,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: `tiptap ${className || ''}`,
      },
      handleKeyDown(view, event) {
        // Tab to accept suggestion (only when suggestion exists)
        if (event.key === 'Tab' && suggestionRef.current) {
          event.preventDefault();
          const accepted = acceptSuggestion();
          if (accepted) {
            const { state, dispatch } = view;
            const tr = state.tr.insertText(accepted, state.selection.to);
            tr.setMeta(ghostTextPluginKey, '');
            dispatch(tr);
          }
          return true;
        }

        // Escape to dismiss suggestion
        if (event.key === 'Escape' && suggestionRef.current) {
          event.preventDefault();
          dismissSuggestion();
          const { state, dispatch } = view;
          const tr = state.tr;
          tr.setMeta(ghostTextPluginKey, '');
          dispatch(tr);
          return true;
        }

        return false;
      },
    },
    onUpdate({ editor }) {
      if (isExternalUpdate.current) return;
      const html = editor.getHTML();
      onUpdate(html);
      // AI autocomplete still uses plain text
      const text = editor.getText();
      requestSuggestion(text, title);
    },
  });

  // Sync external content changes into the editor
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const currentHtml = editor.getHTML();
    if (content !== currentHtml) {
      isExternalUpdate.current = true;
      editor.commands.setContent(content || '');
      isExternalUpdate.current = false;
    }
  }, [content, editor]);

  // Sync suggestion to ProseMirror decoration
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const { view } = editor;
    const tr = view.state.tr;
    tr.setMeta(ghostTextPluginKey, suggestion);
    view.dispatch(tr);
  }, [editor, suggestion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="editor-wrapper">
      {showToolbar && editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

export default TipTapEditor;
