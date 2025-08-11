'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useEffect } from 'react';

// A barra de ferramentas agora é um componente separado para maior clareza
const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-t-lg p-2 flex flex-wrap items-center gap-x-4 gap-y-2 bg-gray-50">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>Negrito</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>Itálico</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`px-2 py-1 rounded ${editor.isActive('blockquote') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>Citação</button>
      <input
        type="color"
        onInput={(event: React.ChangeEvent<HTMLInputElement>) => editor.chain().focus().setColor(event.target.value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="w-6 h-6 border-none bg-transparent cursor-pointer"
        title="Cor do texto"
      />
    </div>
  );
};

type TiptapEditorProps = {
  value: string;
  onChange: (content: string) => void;
};

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Habilitamos explicitamente as funcionalidades que queremos
        bold: {},
        italic: {},
        bulletList: {},
        blockquote: {},
      }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
    ],
    // O conteúdo é passado aqui, mas o useEffect abaixo garante a sincronização
    content: value, 
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // A classe 'prose' do plugin de tipografia é o que aplica os estilos
        class: 'prose max-w-none p-4 border border-t-0 border-gray-300 rounded-b-lg min-h-[300px] focus:outline-none',
      },
    },
    // Esta função é a ÚNICA maneira de enviar as mudanças para o componente pai
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Este useEffect é crucial para carregar o conteúdo inicial ao editar um artigo
  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}