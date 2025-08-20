import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const DocumentEditor = () => {
  const { id } = useParams();
  const location = useLocation();
  const quillRef = useRef();
  const [socket, setSocket] = useState();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [users, setUsers] = useState([]);
  const [isAutoSaved, setIsAutoSaved] = useState(true);
  const message = location.state?.message;

  // Initialize socket
  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);
    s.emit('get-document', id);

    // Load initial document
    s.on('load-document', (doc) => {
      setContent(doc.content || '');
      setTitle(doc.title || 'Untitled Document');
    });

    // Listen for real-time changes
    s.on('receive-changes', (delta) => {
      if (quillRef.current) {
        quillRef.current.getEditor().updateContents(delta);
      }
    });

    // User presence
    s.on('user-connected', (users) => setUsers(users));
    s.on('user-disconnected', (users) => setUsers(users));

    return () => s.disconnect();
  }, [id]);

  // Handle text changes
  const handleTextChange = (value, delta, source) => {
    if (source !== 'user') return;
    setContent(value);
    setIsAutoSaved(false);
    if (socket) socket.emit('send-changes', delta);
  };

  // Auto-save every 2 seconds
  useEffect(() => {
    if (socket && content) {
      const timer = setTimeout(async () => {
        socket.emit('save-document', { id, content, title });
        setIsAutoSaved(true);
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const token = user ? user.token : null;
          await axios.put(
            `http://localhost:5000/api/documents/${id}`,
            { content, title },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error('Failed to save document', err);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, id, socket, title]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet',
    'blockquote', 'code-block', 'link', 'image', 'video',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-medium text-gray-900">{title}</h1>
          <span className={`text-sm ${isAutoSaved ? 'text-green-600' : 'text-gray-500'}`}>
            {isAutoSaved ? 'All changes saved' : 'Saving...'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {users.length > 0 ? `${users.length} active` : 'Just you'}
          </span>
          <div className="flex -space-x-2">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold border-2 border-white shadow-sm"
                title={user.name}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            ))}
            {users.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold border-2 border-white shadow-sm">
                +{users.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 mx-auto max-w-4xl my-6">
        {message && <div className="alert alert-success">{message}</div>}
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={handleTextChange}
          modules={modules}
          formats={formats}
          theme="snow"
          style={{ minHeight: '800px' }}
        />
      </div>
    </div>
  );
};

export default DocumentEditor;
