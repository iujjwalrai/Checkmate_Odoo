import React, { useState } from 'react';

export default function TagSelector({ selected, setSelected }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    if (input && !selected.includes(input)) {
      setSelected([...selected, input]);
      setInput('');
    }
  };

  return (
    <div className="my-4">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
          placeholder="Add a tag"
          className="border p-2 rounded w-full"
        />
        <button onClick={addTag} className="bg-indigo-600 text-white px-3 py-1 rounded">
          Add
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {selected.map((tag, idx) => (
          <span
            key={idx}
            className="bg-gray-200 text-sm px-2 py-1 rounded-full flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => setSelected(selected.filter((_, i) => i !== idx))}
              className="text-red-500 text-xs"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}