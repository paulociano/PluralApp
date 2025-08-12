'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getRoot, $insertNodes } from 'lexical';
import ToolbarPlugin from './ToolbarPlugin';
import { EditorProps } from '@/types';

// Componente interno para carregar o conteúdo HTML inicial
function InitialStatePlugin({ initialHtml }: { initialHtml?: string }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        // Apenas carrega o estado inicial se houver conteúdo e o editor estiver vazio
        if(initialHtml && editor.getEditorState().isEmpty()) {
            editor.update(() => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(initialHtml, 'text/html');
                const nodes = $generateNodesFromDOM(editor, dom);
                $getRoot().select();
                $insertNodes(nodes);
            });
        }
    }, [editor, initialHtml]);
    return null;
}

const editorConfig = {
  namespace: 'PluralEditor',
  theme: {
    ltr: 'text-left',
    rtl: 'text-right',
    paragraph: 'mb-4',
    quote: 'border-l-4 border-gray-300 pl-4 italic my-4',
    list: {
      ul: 'list-disc ml-6 mb-4',
    },
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
    }
  },
  onError(error: Error) {
    throw error;
  },
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, LinkNode],
};

export default function LexicalEditor({ onChange, initialHtml }: EditorProps) {
  return (
    <LexicalComposer initialConfig={{...editorConfig, editorState: null}}>
      <div className="border border-gray-300 rounded-lg">
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={<ContentEditable className="p-4 min-h-[300px] focus:outline-none" />}
            placeholder={<div className="absolute top-4 left-4 text-gray-400 pointer-events-none">Escreva seu artigo...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        {/* --- CORREÇÃO AQUI --- */}
        {/* A função onChange recebe dois parâmetros: editorState e editor */}
        <OnChangePlugin onChange={(editorState, editor) => {
          editorState.read(() => {
            const htmlString = $generateHtmlFromNodes(editor, null);
            onChange(htmlString);
          });
        }} />
        <InitialStatePlugin initialHtml={initialHtml} />
      </div>
    </LexicalComposer>
  );
}