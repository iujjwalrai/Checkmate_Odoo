import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Emoji from '@tiptap/extension-emoji';
import axios from 'axios';

// Top 50 emojis
const TOP_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
];

export default function Tiptap({ content, setContent, placeholder = "Write your content here..." }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const API = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB');
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await axios.post(`${API}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.url) {
          const imageUrl = data.url.startsWith('http') ? data.url : `${API}${data.url}`;
          editor.chain().focus().setImage({ src: imageUrl, alt: 'uploaded' }).run();
          setTimeout(() => {
            if (editor) {
              console.log('Image URL:', imageUrl);
              console.log('Editor HTML:', editor.getHTML());
            }
          }, 100);
        }
      } catch (err) {
        alert('Image upload failed.');
      } finally {
        setUploading(false);
      }
    }
    event.target.value = '';
  };

  const addEmoji = (emoji) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Add global style for all images in the editor and rendered HTML
  if (typeof window !== 'undefined' && !document.getElementById('tiptap-img-thumb-style')) {
    const style = document.createElement('style');
    style.id = 'tiptap-img-thumb-style';
    style.innerHTML = `.ProseMirror img, .tiptap-content img, .question-preview img { max-width: 200px; max-height: 150px; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; transition: box-shadow 0.2s; display: inline-block; margin: 0.5em 0; }
.ProseMirror img:hover, .tiptap-content img:hover, .question-preview img:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.16); }`;
    document.head.appendChild(style);
  }

  // Add click handler to open images in new tab
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === 'IMG') {
        window.open(e.target.src, '_blank', 'noopener');
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="bg-white border-2 border-gray-200 rounded-t-xl p-3 flex flex-wrap gap-2 items-center">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.6 18H6V2h4.32c1.97 0 3.68.9 3.68 2.4 0 1.1-.6 2.1-1.5 2.6.9.5 1.5 1.5 1.5 2.6 0 1.5-1.71 2.4-3.68 2.4H6v6h6.6c1.97 0 3.68-.9 3.68-2.4 0-1.1-.6-2.1-1.5-2.6.9-.5 1.5-1.5 1.5-2.6 0-1.5-1.71-2.4-3.68-2.4z"/>
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 2h8v2h-3l-1 6h4v2H6v-2h3l1-6H8V2z"/>
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
            title="Strikethrough"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 10h14M7 10c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.21-1.79 4-4 4s-4-1.79-4-4z"/>
            </svg>
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h2v2H3V4zm0 5h2v2H3V9zm0 5h2v2H3v-2zM7 4h10v2H7V4zm0 5h10v2H7V9zm0 5h10v2H7v-2z"/>
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h2v2H3V4zm0 5h2v2H3V9zm0 5h2v2H3v-2zM7 4h10v2H7V4zm0 5h10v2H7V9zm0 5h10v2H7v-2z"/>
            </svg>
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h14v2H3V4zm0 5h10v2H3V9zm0 5h12v2H3v-2z"/>
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h14v2H3V4zm2 5h10v2H5V9zm1 5h8v2H6v-2z"/>
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h14v2H3V4zm4 5h10v2H7V9zm2 5h10v2H9v-2z"/>
            </svg>
          </button>
        </div>

        {/* Links and Images */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
          <button
            onClick={() => setShowLinkDialog(true)}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
            title="Add Link"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/>
            </svg>
          </button>
          <button
            onClick={() => setShowImageDialog(true)}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Add Image URL"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
            </svg>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Upload Image from Computer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>

        {/* Emoji Picker */}
        <div className="relative emoji-picker-container">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Add Emoji"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-3 4a3 3 0 100-6 3 3 0 000 6z"/>
            </svg>
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50" style={{ width: 320 }}>
              <div className="grid grid-cols-10 gap-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)' }}>
                {TOP_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => addEmoji(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                    tabIndex={0}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white border-2 border-t-0 border-gray-200 rounded-b-xl">
        <EditorContent 
          editor={editor} 
          className="p-4 min-h-[150px] focus:outline-none prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:list-inside [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:list-inside [&_.ProseMirror_li]:mb-1 [&_.ProseMirror]:bg-white [&_.ProseMirror]:border-none"
        />
        <div className="px-4 pb-4 text-xs text-gray-400">
          {content.length} characters
        </div>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      {uploading && (
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded shadow text-sm text-gray-700 z-50 border border-gray-200">
          Uploading image...
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <input
              type="url"
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={addLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Link
              </button>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <input
              type="url"
              placeholder="Enter image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Image
              </button>
              <button
                onClick={() => setShowImageDialog(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
