'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { FiBold, FiItalic, FiUnderline } from 'react-icons/fi';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300 bg-gray-50 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className="p-2 hover:bg-gray-200 rounded"
        title="Negrito"
      >
        <FiBold />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className="p-2 hover:bg-gray-200 rounded"
        title="Itálico"
      >
        <FiItalic />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className="p-2 hover:bg-gray-200 rounded"
        title="Sublinhado"
      >
        <FiUnderline />
      </button>
    </div>
  );
}