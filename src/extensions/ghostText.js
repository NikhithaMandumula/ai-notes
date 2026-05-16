import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const ghostTextPluginKey = new PluginKey('ghostText');

export const GhostText = Extension.create({
  name: 'ghostText',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: ghostTextPluginKey,
        state: {
          init() {
            return { suggestion: '' };
          },
          apply(tr, prev) {
            const meta = tr.getMeta(ghostTextPluginKey);
            if (meta !== undefined) {
              return { suggestion: meta };
            }
            // Clear suggestion on any document change
            if (tr.docChanged) {
              return { suggestion: '' };
            }
            return prev;
          },
        },
        props: {
          decorations(state) {
            const { suggestion } = ghostTextPluginKey.getState(state);
            if (!suggestion) return DecorationSet.empty;

            const { to } = state.selection;

            const widget = Decoration.widget(to, () => {
              const span = document.createElement('span');
              span.textContent = suggestion;
              span.className = 'ghost-text-suggestion';
              return span;
            }, { side: 1 });

            return DecorationSet.create(state.doc, [widget]);
          },
        },
      }),
    ];
  },
});
