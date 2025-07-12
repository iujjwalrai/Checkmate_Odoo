import React from 'react';

export default function Tiptap({ content, setContent, placeholder = "Write your content here..." }) {
  return (
    <div className="relative">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-4 border-2 border-gray-200 rounded-xl mb-4 min-h-[150px] resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 font-medium text-gray-700 placeholder-gray-400"
        placeholder={placeholder}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      />
      <div className="absolute bottom-6 right-4 text-xs text-gray-400">
        {content.length} characters
      </div>
    </div>
  );
}
