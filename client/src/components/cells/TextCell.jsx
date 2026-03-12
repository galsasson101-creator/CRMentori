import React, { useState, useRef, useEffect } from 'react';

export default function TextCell({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) {
      onSave(draft);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commit();
    } else if (e.key === 'Escape') {
      setDraft(value ?? '');
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 text-sm border border-blue-400 rounded outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    );
  }

  if (onSave) {
    return (
      <span
        onClick={() => {
          setDraft(value ?? '');
          setEditing(true);
        }}
        className="cursor-pointer text-sm text-gray-800 dark:text-gray-200 hover:text-blue-600 truncate block"
        title={value ?? ''}
      >
        {value || '\u00A0'}
      </span>
    );
  }

  return (
    <span className="text-sm text-gray-800 dark:text-gray-200 truncate block" title={value ?? ''}>
      {value || '—'}
    </span>
  );
}
