import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Minus,
  MousePointerClick, Type, Code, AlignRight, AlignCenter, AlignLeft,
} from 'lucide-react';

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-0.5" />;
}

// Check if TipTap HTML is effectively empty (just empty paragraphs/whitespace)
function isHtmlEmpty(html) {
  if (!html) return true;
  const stripped = html.replace(/<p>\s*<\/p>/g, '').replace(/<br\s*\/?>/g, '').trim();
  return stripped.length === 0;
}

export default function EmailEditor({ value, onChange, primaryColor = '#c432e2', placeholder }) {
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState('');
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Image,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || '' }),
    ],
    editorProps: {
      attributes: {
        dir: 'rtl',
        style: `direction:rtl;text-align:right;font-family:'Heebo',Arial,sans-serif;`,
      },
    },
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      isInternalUpdate.current = true;
      // Return empty string if editor is effectively empty
      onChange(isHtmlEmpty(html) ? '' : html);
    },
  });

  // Sync external value changes (e.g. template selection)
  useEffect(() => {
    if (editor && !isInternalUpdate.current && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
    isInternalUpdate.current = false;
  }, [value, editor]);

  const toggleSource = () => {
    if (sourceMode) {
      // Switching back to visual
      if (editor) {
        editor.commands.setContent(sourceValue);
        isInternalUpdate.current = true;
        onChange(sourceValue);
      }
    } else {
      // Switching to source
      setSourceValue(editor ? editor.getHTML() : value || '');
    }
    setSourceMode(!sourceMode);
  };

  const handleSourceChange = (e) => {
    setSourceValue(e.target.value);
    isInternalUpdate.current = true;
    onChange(e.target.value);
  };

  const insertLink = useCallback(() => {
    if (!editor) return;
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const insertImage = useCallback(() => {
    if (!editor) return;
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: 'תמונה' }).run();
    }
  }, [editor]);

  const insertCTA = useCallback(() => {
    if (!editor) return;
    const url = prompt('Enter CTA URL:', 'https://mentori.app');
    if (!url) return;
    const text = prompt('Enter button text:', 'לחצו כאן');
    if (!text) return;
    const ctaHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
  <tr>
    <td align="center" style="direction:rtl;text-align:center;">
      <a href="${url}" target="_blank" style="display:inline-block;background-color:${primaryColor};color:#ffffff;font-family:'Heebo',Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;text-align:center;padding:14px 32px;border-radius:8px;line-height:1.2;">${text}</a>
    </td>
  </tr>
</table>`;
    editor.chain().focus().insertContent(ctaHtml).run();
  }, [editor, primaryColor]);

  const insertName = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent('{{name}}').run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="email-editor border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-300 dark:border-gray-600">
        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Inline formatting */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <ToolbarButton onClick={insertLink} active={editor.isActive('link')} title="Link">
          <LinkIcon size={15} />
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton onClick={insertImage} title="Image">
          <ImageIcon size={15} />
        </ToolbarButton>

        {/* HR */}
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* CTA Button */}
        <button type="button" onClick={insertCTA} title="CTA Button"
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
          <MousePointerClick size={14} />
          <span className="hidden sm:inline">CTA</span>
        </button>

        {/* {{name}} token */}
        <button type="button" onClick={insertName} title="Insert {{name}}"
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Type size={14} />
          <span className="hidden sm:inline">{'{{name}}'}</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Source toggle */}
        <button type="button" onClick={toggleSource} title={sourceMode ? 'Visual Mode' : 'Source Mode'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
            sourceMode
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}>
          <Code size={14} />
          <span className="hidden sm:inline">{sourceMode ? 'Visual' : 'Source'}</span>
        </button>
      </div>

      {/* Editor / Source */}
      {sourceMode ? (
        <textarea
          value={sourceValue}
          onChange={handleSourceChange}
          className="w-full min-h-[300px] p-4 bg-white dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-gray-100 outline-none resize-y"
          dir="ltr"
        />
      ) : (
        <div className="bg-white dark:bg-gray-900">
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
